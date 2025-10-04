import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const Classificacao = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mission, setMission] = useState<string>("KOI");
  const [threshold, setThreshold] = useState([0.5]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingModelInfo, setLoadingModelInfo] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setLoadingModelInfo(true);
      const response = await fetch("http://localhost:8000/api/v1/model/info", {
        method: "GET",
      });

      if (!response.ok) {
        console.warn("Não foi possível carregar informações do modelo");
        setModelInfo(null);
        return;
      }

      const data = await response.json();
      setModelInfo(data);
    } catch (error) {
      console.warn("Erro ao buscar informações do modelo:", error);
      setModelInfo(null);
    } finally {
      setLoadingModelInfo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast({
        title: "Arquivo carregado",
        description: `${e.target.files[0].name} está pronto para validação.`,
      });
    }
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0]
          .split(",")
          .map((col) => col.trim().replace(/['"]/g, ""));

        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((val) => val.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            // Tentar converter para número, senão manter como string
            row[header] = isNaN(Number(value)) ? value : Number(value);
          });
          return row;
        });

        resolve(data);
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo CSV"));
      };

      reader.readAsText(file);
    });
  };

  const validateCSVColumns = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split("\n")[0];
        const columns = firstLine
          .split(",")
          .map((col) => col.trim().replace(/['"]/g, ""));

        const requiredColumns = [
          "transit_id",
          "pl_period",
          "pl_transit_duration",
          "pl_transit_depth",
          "pl_radius",
          "pl_eq_temp",
          "pl_insolation_flux",
          "st_eff_temp",
          "st_radius",
          "st_logg",
        ];

        const missingColumns = requiredColumns.filter(
          (col) => !columns.includes(col)
        );

        if (missingColumns.length > 0) {
          toast({
            title: "Erro de Validação",
            description: `Colunas faltando: ${missingColumns.join(", ")}`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          toast({
            title: "Validação OK",
            description: "Todas as colunas necessárias foram encontradas!",
          });
          resolve(true);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Erro ao ler arquivo",
          description: "Não foi possível ler o arquivo CSV.",
          variant: "destructive",
        });
        reject(false);
      };

      reader.readAsText(file);
    });
  };

  const sendCSVToAPI = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mission", mission);
    formData.append("threshold", threshold[0].toString());

    const response = await fetch("http://localhost:8000/api/v1/predict", {
      method: "POST",
      body: formData,
      headers: {
        // Não definir Content-Type, deixar o browser definir com boundary
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${errorData}`);
    }

    return await response.json();
  };

  const handleClassify = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, carregue um arquivo CSV primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validar colunas do CSV
      const isValid = await validateCSVColumns(file);

      if (!isValid) {
        setIsProcessing(false);
        return;
      }

      // Enviar CSV para a API
      const apiData = await sendCSVToAPI(file);

      // Ler dados completos do CSV
      const csvData = await parseCSV(file);

      // Garante que apiData seja sempre um array
      const apiDataArray = Array.isArray(apiData) ? apiData : [apiData];

      // Combinar dados da API (predições) com dados do CSV
      const mappedRows = apiDataArray
        .map((apiItem: any) => {
          // Encontrar a linha correspondente no CSV pelo transit_id
          const csvRow = csvData.find(
            (row) => row.transit_id === apiItem.transit_id
          );

          if (!csvRow) {
            console.warn(
              `Linha não encontrada no CSV para transit_id: ${apiItem.transit_id}`
            );
            return null;
          }

          // Mapear predição (1 = CONFIRMED, 0 = FALSE POSITIVE, etc)
          const predictionMap: any = {
            "1": "CONFIRMED",
            "0": "FALSE",
          };

          return {
            id: apiItem.transit_id,
            prediction:
              predictionMap[apiItem.prediction] ||
              apiItem.prediction.toUpperCase(),
            confidence: apiItem.confidence,
            pl_period: csvRow.pl_period || 0,
            pl_transit_duration: csvRow.pl_transit_duration || 0,
            pl_transit_depth: csvRow.pl_transit_depth || 0, // em %
            pl_transit_depth_ppm: (csvRow.pl_transit_depth || 0) * 10000, // converter % para ppm
            pl_radius: csvRow.pl_radius || 0,
            pl_eq_temp: csvRow.pl_eq_temp || 0,
            pl_insolation_flux: csvRow.pl_insolation_flux || 0,
            st_eff_temp: csvRow.st_eff_temp || 0,
            st_radius: csvRow.st_radius || 0,
            st_logg: csvRow.st_logg || 0,
          };
        })
        .filter((row) => row !== null); // Remove linhas nulas

      setResults({
        rows: mappedRows,
        summary: {
          CONFIRMED: mappedRows.filter((r: any) => r.prediction === "CONFIRMED")
            .length,
          PC: mappedRows.filter((r: any) => r.prediction === "PC").length,
          FP: mappedRows.filter(
            (r: any) =>
              r.prediction === "FP" || r.prediction === "FALSE POSITIVE"
          ).length,
          APC: mappedRows.filter((r: any) => r.prediction === "APC").length,
          KP: mappedRows.filter((r: any) => r.prediction === "KP").length,
        },
        total: mappedRows.length,
      });

      toast({
        title: "Classificação completa!",
        description: `${mappedRows.length} objetos classificados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao classificar:", error);
      toast({
        title: "Erro na classificação",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container pt-24 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Classificação de Exoplanetas
          </h1>
          <p className="text-xl text-muted-foreground">
            Faça upload do seu CSV e classifique candidatos usando nosso modelo
            Specttra
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Sobre o Modelo */}
          {!loadingModelInfo && modelInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    {modelInfo.name || "Sobre o Modelo Specttra"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {modelInfo.description ||
                      "Modelo de Machine Learning treinado com dados de missões espaciais"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.roc_auc?.toFixed(2) || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ROC-AUC Score
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Excelente capacidade de discriminação
                      </p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.accuracy
                          ? `${(modelInfo.metrics.accuracy * 100).toFixed(0)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Acurácia
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Alta precisão nas predições
                      </p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.f1_score?.toFixed(2) || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        F1-Score
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Balanceamento ideal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload de Dados
                </CardTitle>
                <CardDescription>
                  Carregue seu arquivo CSV ou Parquet com features de trânsito
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mission">Missão (contexto)</Label>
                  <Select value={mission} onValueChange={setMission}>
                    <SelectTrigger id="mission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KOI">Kepler (KOI)</SelectItem>
                      <SelectItem value="K2">K2</SelectItem>
                      <SelectItem value="TESS">TESS</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">Arquivo CSV/Parquet</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.parquet"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Colunas Esperadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "transit_id",
                      "pl_period",
                      "pl_transit_duration",
                      "pl_transit_depth",
                      "pl_radius",
                      "pl_eq_temp",
                      "pl_insolation_flux",
                      "st_eff_temp",
                      "st_radius",
                      "st_logg",
                    ].map((col) => (
                      <Badge key={col} variant="secondary">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {file && !isProcessing && !results && (
              <Button onClick={handleClassify} size="lg" className="w-full">
                Classificar com Specttra
              </Button>
            )}

            {isProcessing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      <span className="text-sm font-medium">
                        Processando dados...
                      </span>
                    </div>
                    <Progress value={66} />
                  </div>
                </CardContent>
              </Card>
            )}

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Resultados da Classificação
                  </CardTitle>
                  <CardDescription>
                    {results.total} objetos classificados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(results.summary).map(([label, count]) => (
                      <div key={label} className="bg-muted rounded-lg p-4">
                        <div className="text-2xl font-bold">
                          {count as number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Período Orbital (dias)</TableHead>
                          <TableHead>Duração Trânsito (h)</TableHead>
                          <TableHead>Profundidade (ppm)</TableHead>
                          <TableHead>Raio (R⊕)</TableHead>
                          <TableHead>Temp. Eq. (K)</TableHead>
                          <TableHead>Predição</TableHead>
                          <TableHead className="text-right">
                            Confiança
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.rows.map((row: any) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">
                              {row.id}
                            </TableCell>
                            <TableCell>{row.pl_period.toFixed(2)}</TableCell>
                            <TableCell>
                              {row.pl_transit_duration.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {row.pl_transit_depth_ppm.toFixed(0)}
                            </TableCell>
                            <TableCell>{row.pl_radius.toFixed(2)}</TableCell>
                            <TableCell>{row.pl_eq_temp.toFixed(0)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  row.prediction === "CONFIRMED"
                                    ? "default"
                                    : row.prediction === "PC"
                                    ? "secondary"
                                    : "outline"
                                }>
                                {row.prediction}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {(row.confidence * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Resultados (CSV)
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Classificacao;
