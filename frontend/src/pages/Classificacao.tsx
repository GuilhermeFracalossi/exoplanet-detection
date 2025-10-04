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
  Settings,
  HelpCircle,
  Info,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  // Novos estados para visualização de dados
  const [csvData, setCsvData] = useState<any[]>([]);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewItemsPerPage] = useState(10);

  const { toast } = useToast();
  useEffect(() => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      try {
        // Parse CSV e armazenar dados
        const data = await parseCSV(selectedFile);
        setCsvData(data);
        setShowDataPreview(true);
        setPreviewPage(1);

        toast({
          title: "Arquivo carregado",
          description: `${data.length} registros encontrados. Revise os dados antes de classificar.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao ler arquivo",
          description: "Não foi possível processar o arquivo CSV.",
          variant: "destructive",
        });
      }
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
    formData.append("mission", "Custom"); // Default mission
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
    } else if (confidence >= thresholdValue - 0.3) {
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

  const handleExportCSV = () => {
    if (!results || !results.rows || results.rows.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Não há resultados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Cabeçalhos do CSV
      const headers = [
        "ID",
        "Classificação",
        "Confiança (%)",
        "Período Orbital (dias)",
        "Duração Trânsito (h)",
        "Profundidade (ppm)",
        "Raio (R⊕)",
        "Temp. Eq. (K)",
        "Fluxo Insolação",
        "Temp. Estelar (K)",
        "Raio Estelar (R☉)",
        "Log g Estelar",
      ];

      // Criar linhas do CSV com classificação dinâmica
      const csvRows = results.rows.map((row: any) => {
        const dynamicPrediction = getDynamicPrediction(row.confidence);
        return [
          row.id,
          dynamicPrediction,
          (row.confidence * 100).toFixed(1),
          row.pl_period.toFixed(2),
          row.pl_transit_duration.toFixed(2),
          row.pl_transit_depth_ppm.toFixed(0),
          row.pl_radius.toFixed(2),
          row.pl_eq_temp.toFixed(0),
          row.pl_insolation_flux.toFixed(2),
          row.st_eff_temp.toFixed(0),
          row.st_radius.toFixed(2),
          row.st_logg.toFixed(2),
        ].join(",");
      });

      // Juntar cabeçalhos e linhas
      const csvContent = [headers.join(","), ...csvRows].join("\n");

      // Criar Blob e fazer download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `exoplanetas_classificacao_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída!",
        description: `${results.rows.length} resultados exportados para ${filename}`,
      });
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os resultados.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExampleCSV = () => {
    try {
      // Dados de exemplo realistas
      const exampleData = [
        {
          transit_id: "KOI-001.01",
          pl_period: 10.85,
          pl_transit_duration: 2.8,
          pl_transit_depth: 84.0,
          pl_radius: 1.05,
          pl_eq_temp: 285.0,
          pl_insolation_flux: 1.2,
          st_eff_temp: 5750.0,
          st_radius: 1.02,
          st_logg: 4.43,
        },
        {
          transit_id: "TESS-123.02",
          pl_period: 3.14,
          pl_transit_duration: 1.5,
          pl_transit_depth: 120.0,
          pl_radius: 2.1,
          pl_eq_temp: 620.0,
          pl_insolation_flux: 15.5,
          st_eff_temp: 6100.0,
          st_radius: 1.35,
          st_logg: 4.21,
        },
        {
          transit_id: "K2-42.01",
          pl_period: 365.25,
          pl_transit_duration: 6.2,
          pl_transit_depth: 45.0,
          pl_radius: 0.95,
          pl_eq_temp: 255.0,
          pl_insolation_flux: 1.0,
          st_eff_temp: 5778.0,
          st_radius: 1.0,
          st_logg: 4.44,
        },
      ];

      // Gerar CSV
      const headers = [
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

      const csvRows = [
        headers.join(","),
        ...exampleData.map((row) =>
          headers.map((header) => row[header as keyof typeof row]).join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Download
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "exoplanetas_template_exemplo.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV de exemplo baixado!",
        description: "Use este arquivo como template para suas análises.",
      });
    } catch (error) {
      console.error("Erro ao gerar CSV de exemplo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o CSV de exemplo.",
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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Colunas Obrigatórias do CSV
                    </h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Info className="h-6 w-6 text-primary" />
                            Estrutura do CSV para Classificação
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            Seu arquivo CSV deve conter as seguintes colunas com
                            dados de trânsito planetário. Baixe o arquivo de
                            exemplo para começar rapidamente.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div className="grid gap-4">
                            {/* Transit ID */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Identificador
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    transit_id
                                  </h4>
                                </div>
                                <Badge>Texto</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Identificador único do candidato (ex:
                                "K00001.01", "TESS-123", etc.)
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: "KOI-001", "K2-42b", "TOI-700"
                              </div>
                            </div>

                            {/* Planet Period */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Período Orbital
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_period
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Período orbital do planeta em dias. Tempo que o
                                planeta leva para completar uma órbita.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 365.25 (dias) | Unidade: dias
                              </div>
                            </div>

                            {/* Transit Duration */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Duração do Trânsito
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_transit_duration
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Duração do trânsito em horas. Tempo que o
                                planeta leva para cruzar o disco estelar.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 3.2 (horas) | Unidade: horas
                              </div>
                            </div>

                            {/* Transit Depth */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Profundidade do Trânsito
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_transit_depth
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Diminuição relativa do brilho estelar durante o
                                trânsito (em partes por milhão).
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 84.0 (ppm) | Unidade: partes por milhão
                              </div>
                            </div>

                            {/* Planet Radius */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Raio Planetário
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_radius
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Raio do planeta em raios terrestres (R⊕). Terra
                                = 1.0
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 1.0 (raios terrestres) | Terra = 1.0,
                                Júpiter ≈ 11.2
                              </div>
                            </div>

                            {/* Equilibrium Temperature */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Temperatura de Equilíbrio
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_eq_temp
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Temperatura de equilíbrio do planeta em Kelvin,
                                assumindo albedo zero.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 288 (K) | Terra ≈ 255K, zona habitável
                                ≈ 200-300K
                              </div>
                            </div>

                            {/* Insolation Flux */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Fluxo de Insolação
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_insolation_flux
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Fluxo estelar incidente no planeta em unidades
                                de fluxo terrestre.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 1.0 (fluxo terrestre) | Terra = 1.0
                              </div>
                            </div>

                            {/* Stellar Effective Temperature */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Temperatura Estelar
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    st_eff_temp
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Temperatura efetiva da estrela hospedeira em
                                Kelvin.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 5778 (K) | Sol = 5778K
                              </div>
                            </div>

                            {/* Stellar Radius */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Raio Estelar
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    st_radius
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Raio da estrela hospedeira em raios solares
                                (R☉). Sol = 1.0
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 1.0 (raios solares) | Sol = 1.0
                              </div>
                            </div>

                            {/* Stellar Surface Gravity */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Gravidade Superficial
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    st_logg
                                  </h4>
                                </div>
                                <Badge>Numérico</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Logaritmo da gravidade superficial da estrela
                                (log₁₀[cm/s²]).
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Exemplo: 4.44 (log₁₀[cm/s²]) | Sol ≈ 4.44
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={handleDownloadExampleCSV}
                              className="flex-1 gap-2">
                              <Download className="h-4 w-4" />
                              Baixar CSV de Exemplo
                            </Button>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Dicas Importantes
                            </h5>
                            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                              <li>
                                Todas as colunas são obrigatórias para o modelo
                                funcionar
                              </li>
                              <li>
                                Valores numéricos devem usar ponto (.) como
                                separador decimal
                              </li>
                              <li>
                                O arquivo deve estar em formato CSV com
                                separador por vírgula
                              </li>
                              <li>
                                Certifique-se de que não há valores vazios ou
                                inválidos
                              </li>
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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

            {/* Tela de Preview dos Dados */}
            {showDataPreview && csvData.length > 0 && !results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Visualização dos Dados
                        </CardTitle>
                        <CardDescription>
                          {csvData.length} registros carregados • Revise antes
                          de classificar
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDataPreview(false);
                          setFile(null);
                          setCsvData([]);
                        }}>
                        <X className="h-4 w-4 mr-2" />
                        Trocar Arquivo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {csvData.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total de Registros
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.keys(csvData[0] || {}).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Colunas
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {((file?.size || 0) / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tamanho
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.ceil(csvData.length / previewItemsPerPage)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Páginas
                        </div>
                      </div>
                    </div>

                    {/* Tabela de Preview */}
                    <div className="border rounded-lg">
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              {Object.keys(csvData[0] || {}).map((col) => (
                                <TableHead key={col} className="min-w-[120px]">
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData
                              .slice(
                                (previewPage - 1) * previewItemsPerPage,
                                previewPage * previewItemsPerPage
                              )
                              .map((row, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {(previewPage - 1) * previewItemsPerPage +
                                      idx +
                                      1}
                                  </TableCell>
                                  {Object.values(row).map(
                                    (value: any, cellIdx) => (
                                      <TableCell key={cellIdx}>
                                        {typeof value === "number"
                                          ? value.toFixed(3)
                                          : value}
                                      </TableCell>
                                    )
                                  )}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>

                    {/* Paginação do Preview */}
                    {csvData.length > previewItemsPerPage && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Mostrando{" "}
                          {(previewPage - 1) * previewItemsPerPage + 1} a{" "}
                          {Math.min(
                            previewPage * previewItemsPerPage,
                            csvData.length
                          )}{" "}
                          de {csvData.length} registros
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewPage(1)}
                            disabled={previewPage === 1}>
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewPage(previewPage - 1)}
                            disabled={previewPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm px-4">
                            Página {previewPage} de{" "}
                            {Math.ceil(csvData.length / previewItemsPerPage)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewPage(previewPage + 1)}
                            disabled={
                              previewPage ===
                              Math.ceil(csvData.length / previewItemsPerPage)
                            }>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPreviewPage(
                                Math.ceil(csvData.length / previewItemsPerPage)
                              )
                            }
                            disabled={
                              previewPage ===
                              Math.ceil(csvData.length / previewItemsPerPage)
                            }>
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {file && !isProcessing && !results && showDataPreview && (
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
                        {filterPrediction !== "all" &&
                          `(filtrados por ${filterPrediction})`}
                      </CardDescription>
                    </div>

                    {/* Toggle de visualização */}
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        Tabela
                      </Button>
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}>
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Cards
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resumo Dinâmico */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(getDynamicSummary()).map(
                      ([label, count]) => (
                        <button
                          key={label}
                          onClick={() =>
                            setFilterPrediction(
                              filterPrediction === label ? "all" : label
                            )
                          }
                          className={`bg-muted rounded-lg p-4 transition-all hover:scale-105 ${
                            filterPrediction === label
                              ? "ring-2 ring-primary"
                              : ""
                          }`}>
                          <div className="text-2xl font-bold">
                            {count as number}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                            <Filter className="h-3 w-3" />
                            {label}
                          </div>
                        </button>
                      )
                    )}
                  </div>

                  {/* Filtros */}
                  <div className="flex items-center gap-4">
                    <Select
                      value={filterPrediction}
                      onValueChange={(value) => {
                        setFilterPrediction(value);
                        setCurrentPage(1);
                      }}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Filtrar por classificação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="PLANETA CONFIRMADO">
                          Planeta Confirmado
                        </SelectItem>
                        <SelectItem value="CANDIDATO FORTE">
                          Candidato Forte
                        </SelectItem>
                        <SelectItem value="CANDIDATO FRACO">
                          Candidato Fraco
                        </SelectItem>
                        <SelectItem value="FALSO POSITIVO">
                          Falso Positivo
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {filterPrediction !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterPrediction("all");
                          setCurrentPage(1);
                        }}>
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
                              <TableHead className="text-right">
                                Conf.
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPaginatedResults().map((row: any) => {
                              const dynamicPrediction = getDynamicPrediction(
                                row.confidence
                              );
                              return (
                                <TableRow key={row.id}>
                                  <TableCell className="font-medium font-mono text-xs">
                                    {row.id}
                                  </TableCell>
                                  <TableCell>
                                    {row.pl_period.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {row.pl_transit_duration.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {row.pl_transit_depth_ppm.toFixed(0)}
                                  </TableCell>
                                  <TableCell>
                                    {row.pl_radius.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {row.pl_eq_temp.toFixed(0)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={getPredictionColor(
                                        dynamicPrediction
                                      )}>
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
                        const dynamicPrediction = getDynamicPrediction(
                          row.confidence
                        );
                        return (
                          <Card
                            key={row.id}
                            className="hover:shadow-lg transition-shadow">
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
                                  <Badge
                                    variant={getPredictionColor(
                                      dynamicPrediction
                                    )}>
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
                                  <span className="text-muted-foreground">
                                    Período:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_period.toFixed(2)} dias
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Duração:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_transit_duration.toFixed(2)} h
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Profundidade:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_transit_depth_ppm.toFixed(0)} ppm
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Raio:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_radius.toFixed(2)} R⊕
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Temp. Eq.:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_eq_temp.toFixed(0)} K
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Fluxo:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_insolation_flux.toFixed(1)}
                                  </div>
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
                        Página {currentPage} de {totalPages} (
                        {getFilteredResults().length} resultados)
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Primeira Página */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          title="Primeira página">
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Página Anterior */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          title="Página anterior">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Input de Página */}
                        <form
                          onSubmit={handlePageInputSubmit}
                          className="flex items-center gap-2">
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
                          <span className="text-sm text-muted-foreground">
                            / {totalPages}
                          </span>
                        </form>

                        {/* Página Seguinte */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          title="Próxima página">
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Última Página */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          title="Última página">
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Controle de Threshold Discreto */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Configurações Avançadas
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 p-4 border rounded-lg bg-muted/30 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Limite de Confiança</Label>
                          <span className="text-sm font-semibold text-primary">
                            {(classificationThreshold[0] * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Slider
                          value={classificationThreshold}
                          onValueChange={(value) => {
                            setClassificationThreshold(value);
                            setCurrentPage(1);
                          }}
                          min={0.3}
                          max={0.95}
                          step={0.05}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Ajusta o nível de confiança para classificação dos
                          resultados
                        </p>
                      </div>

                      {/* Legenda compacta */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Badge variant="default" className="h-5 text-xs">
                            CONFIRM
                          </Badge>
                          <span className="text-muted-foreground">
                            ≥{(classificationThreshold[0] * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="h-5 text-xs">
                            FORTE
                          </Badge>
                          <span className="text-muted-foreground">
                            ≥
                            {(
                              (classificationThreshold[0] - 0.15) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="h-5 text-xs">
                            FRACO
                          </Badge>
                          <span className="text-muted-foreground">
                            ≥
                            {((classificationThreshold[0] - 0.3) * 100).toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </details>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleExportCSV}>
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
