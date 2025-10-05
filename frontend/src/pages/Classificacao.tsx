import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  LayoutGrid,
  TableIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Classificacao = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mission, setMission] = useState<string>("KOI");
  const [threshold, setThreshold] = useState([0.5]);
  const [classificationThreshold, setClassificationThreshold] = useState([0.7]); // Threshold para classificação dinâmica
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingModelInfo, setLoadingModelInfo] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterPrediction, setFilterPrediction] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [pageInput, setPageInput] = useState<string>("1");
  const { toast } = useToast();  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setLoadingModelInfo(true);

      // Buscar métricas da mesma forma que o Index.tsx
      const response = await fetch("http://localhost:8000/api/v1/metrics", {
        method: "GET",
      });

      if (!response.ok) {
        console.warn("Não foi possível carregar informações do modelo");
        setModelInfo(null);
        return;
      }

      const data = await response.json();

      // Extrair o primeiro modelo interno (mesmo formato do Index.tsx)
      const modelo = data.modelos_internos?.[0];

      if (modelo) {
        // Mapear para o formato esperado pela interface
        setModelInfo({
          name: modelo.Modelo || "ExoSight Model",
          description:
            "Modelo de Machine Learning treinado com dados de missões espaciais Kepler, K2 e TESS",
          metrics: {
            roc_auc: modelo.AUC_ROC_Media || 0,
            accuracy: modelo.Acuracia_Media || 0,
            f1_score: modelo.F1_Planeta_Media || 0,
          },
        });
      } else {
        setModelInfo(null);
      }
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

  // Filtrar e paginar resultados
  const getFilteredResults = () => {
    if (!results) return [];
    
    let filtered = results.rows;
    
    if (filterPrediction !== "all") {
      filtered = filtered.filter((row: any) => {
        const dynamicPrediction = getDynamicPrediction(row.confidence);
        return dynamicPrediction === filterPrediction;
      });
    }
    
    return filtered;
  };

  // Função para determinar a classificação baseada no threshold
  const getDynamicPrediction = (confidence: number): string => {
    const thresholdValue = classificationThreshold[0];
    
    if (confidence >= thresholdValue) {
      return "PLANETA CONFIRMADO";
    } else if (confidence >= thresholdValue - 0.15) {
      return "CANDIDATO FORTE";
    } else if (confidence >= thresholdValue - 0.30) {
      return "CANDIDATO FRACO";
    } else {
      return "FALSO POSITIVO";
    }
  };

  // Calcular resumo dinâmico baseado no threshold
  const getDynamicSummary = () => {
    if (!results) return {};
    
    const summary: any = {
      "PLANETA CONFIRMADO": 0,
      "CANDIDATO FORTE": 0,
      "CANDIDATO FRACO": 0,
      "FALSO POSITIVO": 0,
    };
    
    results.rows.forEach((row: any) => {
      const prediction = getDynamicPrediction(row.confidence);
      summary[prediction]++;
    });
    
    return summary;
  };

  const getPaginatedResults = () => {
    const filtered = getFilteredResults();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredResults().length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(currentPage.toString());
      toast({
        title: "Página inválida",
        description: `Por favor, insira um número entre 1 e ${totalPages}`,
        variant: "destructive",
      });
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "PLANETA CONFIRMADO":
        return "default";
      case "CANDIDATO FORTE":
        return "secondary";
      case "CANDIDATO FRACO":
        return "outline";
      case "FALSO POSITIVO":
        return "destructive";
      default:
        return "outline";
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Resultados da Classificação
                      </CardTitle>
                      <CardDescription>
                        {getFilteredResults().length} de {results.total} objetos{" "}
                        {filterPrediction !== "all" && `(filtrados por ${filterPrediction})`}
                      </CardDescription>
                    </div>
                    
                    {/* Toggle de visualização */}
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                      >
                        <TableIcon className="h-4 w-4 mr-2" />
                        Tabela
                      </Button>
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                      >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Cards
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Controle de Threshold Dinâmico */}
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Threshold de Classificação</h3>
                        <p className="text-sm text-muted-foreground">
                          Ajuste a confiança mínima para classificar como planeta confirmado
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {(classificationThreshold[0] * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confiança mínima</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={classificationThreshold}
                        onValueChange={(value) => {
                          setClassificationThreshold(value);
                          setCurrentPage(1); // Reset para primeira página
                        }}
                        min={0.3}
                        max={0.95}
                        step={0.05}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Menos restritivo (30%)</span>
                        <span>Mais restritivo (95%)</span>
                      </div>
                    </div>

                    {/* Legenda de classificação */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="whitespace-nowrap">CONFIRMADO</Badge>
                        <span className="text-xs">≥ {(classificationThreshold[0] * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="whitespace-nowrap">FORTE</Badge>
                        <span className="text-xs">≥ {((classificationThreshold[0] - 0.15) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="whitespace-nowrap">FRACO</Badge>
                        <span className="text-xs">≥ {((classificationThreshold[0] - 0.30) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="whitespace-nowrap">FALSO POS.</Badge>
                        <span className="text-xs">&lt; {((classificationThreshold[0] - 0.30) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Dinâmico */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(getDynamicSummary()).map(([label, count]) => (
                      <button
                        key={label}
                        onClick={() => setFilterPrediction(filterPrediction === label ? "all" : label)}
                        className={`bg-muted rounded-lg p-4 transition-all hover:scale-105 ${
                          filterPrediction === label ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <div className="text-2xl font-bold">
                          {count as number}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                          <Filter className="h-3 w-3" />
                          {label}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Filtros */}
                  <div className="flex items-center gap-4">
                    <Select value={filterPrediction} onValueChange={(value) => {
                      setFilterPrediction(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Filtrar por classificação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="PLANETA CONFIRMADO">Planeta Confirmado</SelectItem>
                        <SelectItem value="CANDIDATO FORTE">Candidato Forte</SelectItem>
                        <SelectItem value="CANDIDATO FRACO">Candidato Fraco</SelectItem>
                        <SelectItem value="FALSO POSITIVO">Falso Positivo</SelectItem>
                      </SelectContent>
                    </Select>

                    {filterPrediction !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterPrediction("all");
                          setCurrentPage(1);
                        }}
                      >
                        Limpar filtro
                      </Button>
                    )}
                  </div>

                  {/* Visualização em Tabela */}
                  {viewMode === "table" && (
                    <div className="border rounded-lg">
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">ID</TableHead>
                              <TableHead>Período (d)</TableHead>
                              <TableHead>Duração (h)</TableHead>
                              <TableHead>Prof. (ppm)</TableHead>
                              <TableHead>Raio (R⊕)</TableHead>
                              <TableHead>Temp. (K)</TableHead>
                              <TableHead>Classificação</TableHead>
                              <TableHead className="text-right">Conf.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedResults().map((row: any) => {
                              const dynamicPrediction = getDynamicPrediction(row.confidence);
                              return (
                                <TableRow key={row.id}>
                                  <TableCell className="font-medium font-mono text-xs">
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
                                    <Badge variant={getPredictionColor(dynamicPrediction)}>
                                      {dynamicPrediction}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {(row.confidence * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  )}

                  {/* Visualização em Cards */}
                  {viewMode === "cards" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {getPaginatedResults().map((row: any) => {
                        const dynamicPrediction = getDynamicPrediction(row.confidence);
                        return (
                          <Card key={row.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base font-mono">
                                    {row.id}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    Candidato a exoplaneta
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant={getPredictionColor(dynamicPrediction)}>
                                    {dynamicPrediction}
                                  </Badge>
                                  <span className="text-xs font-semibold">
                                    {(row.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Período:</span>
                                  <div className="font-semibold">{row.pl_period.toFixed(2)} dias</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duração:</span>
                                  <div className="font-semibold">{row.pl_transit_duration.toFixed(2)} h</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Profundidade:</span>
                                  <div className="font-semibold">{row.pl_transit_depth_ppm.toFixed(0)} ppm</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Raio:</span>
                                  <div className="font-semibold">{row.pl_radius.toFixed(2)} R⊕</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Temp. Eq.:</span>
                                  <div className="font-semibold">{row.pl_eq_temp.toFixed(0)} K</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Fluxo:</span>
                                  <div className="font-semibold">{row.pl_insolation_flux.toFixed(1)}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages} ({getFilteredResults().length} resultados)
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Primeira Página */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          title="Primeira página"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Página Anterior */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          title="Página anterior"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Input de Página */}
                        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={pageInput}
                            onChange={handlePageInputChange}
                            onBlur={handlePageInputSubmit}
                            className="w-16 h-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            title="Digite o número da página"
                          />
                          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                        </form>
                        
                        {/* Página Seguinte */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          title="Próxima página"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Última Página */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          title="Última página"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

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
