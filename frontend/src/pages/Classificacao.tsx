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

      // Buscar métricas da API
      const response = await fetch("http://localhost:8000/api/v1/metrics", {
        method: "GET",
      });

      if (!response.ok) {
        console.warn("Não foi possível carregar informações do modelo");
        setModelInfo(null);
        return;
      }

      const data = await response.json();

      // Usar métricas globais de teste
      const metricas = data.metricas_globais_teste;

      if (metricas) {
        // Mapear para o formato esperado pela interface
        setModelInfo({
          name: "Specttra Model",
          description:
            "Machine Learning model trained with data from Kepler, K2 and TESS space missions",
          metrics: {
            roc_auc: metricas.auc_roc || 0,
            accuracy: metricas.acuracia || 0,
            f1_score: metricas.f1_score_planeta || 0,
          },
        });
      } else {
        setModelInfo(null);
      }
    } catch (error) {
      console.warn("Error fetching model information:", error);
      setModelInfo(null);
    } finally {
      setLoadingModelInfo(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      try {
        // Validate CSV columns first
        const isValid = await validateCSVColumns(selectedFile);

        if (!isValid) {
          // Clear the file input if validation fails
          e.target.value = "";
          setFile(null);
          setCsvData([]);
          setShowDataPreview(false);
          return;
        }

        // If valid, set file and parse CSV
        setFile(selectedFile);

        // Parse CSV and store data
        const data = await parseCSV(selectedFile);
        setCsvData(data);
        setShowDataPreview(true);
        setPreviewPage(1);

        toast({
          title: "File loaded successfully",
          description: `${data.length} records found and validated. Review the data before classifying.`,
        });
      } catch (error) {
        console.error("Error processing file:", error);
        e.target.value = "";
        setFile(null);
        setCsvData([]);
        setShowDataPreview(false);
        toast({
          title: "Error reading file",
          description: "Could not process the CSV file.",
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
            // Keep transit_id as string, convert others to number if possible
            if (header.toLowerCase() === "transit_id") {
              row[header] = value;
            } else {
              row[header] = isNaN(Number(value)) ? value : Number(value);
            }
          });
          return row;
        });

        console.log("CSV parsed:", data.length, "rows");
        if (data.length > 0) {
          console.log(
            "Sample transit_id from CSV:",
            data[0].transit_id,
            "(type:",
            typeof data[0].transit_id,
            ")"
          );
        }

        resolve(data);
      };

      reader.onerror = () => {
        reject(new Error("Error reading CSV file"));
      };

      reader.readAsText(file);
    });
  };

  const validateCSVColumns = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;

          if (!text || text.trim().length === 0) {
            toast({
              title: "Invalid CSV",
              description: "The CSV file is empty.",
              variant: "destructive",
            });
            resolve(false);
            return;
          }

          const lines = text
            .split("\n")
            .filter((line) => line.trim().length > 0);

          if (lines.length === 0) {
            toast({
              title: "Invalid CSV",
              description: "No data found in CSV file.",
              variant: "destructive",
            });
            resolve(false);
            return;
          }

          const firstLine = lines[0];
          const columns = firstLine
            .split(",")
            .map((col) => col.trim().replace(/['"]/g, "").toLowerCase());

          console.log("CSV Columns found:", columns);

          const requiredColumns = [
            "transit_id",
            "pl_period",
            "pl_transit_duration",
            "pl_radius",
            "st_eff_temp",
            "st_radius",
          ];

          const missingColumns = requiredColumns.filter(
            (col) => !columns.includes(col.toLowerCase())
          );

          console.log("Missing columns:", missingColumns);

          if (missingColumns.length > 0) {
            toast({
              title: "Validation Error",
              description: `Missing required columns: ${missingColumns.join(
                ", "
              )}`,
              variant: "destructive",
            });
            resolve(false);
          } else {
            toast({
              title: "CSV Validated ✓",
              description: "All required columns were found!",
            });
            resolve(true);
          }
        } catch (error) {
          console.error("Error validating CSV:", error);
          toast({
            title: "Validation Error",
            description: "Could not parse the CSV file.",
            variant: "destructive",
          });
          resolve(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the CSV file.",
          variant: "destructive",
        });
        resolve(false);
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
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  };

  const handleClassify = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // File is already validated during upload - proceed directly to API
      // Send CSV to API
      const apiData = await sendCSVToAPI(file);

      // Ler dados completos do CSV
      const csvData = await parseCSV(file);

      // Garante que apiData seja sempre um array
      const apiDataArray = Array.isArray(apiData) ? apiData : [apiData];

      console.log("=== Classification Matching Debug ===");
      console.log("API returned:", apiDataArray.length, "predictions");
      console.log("CSV contains:", csvData.length, "rows");

      if (apiDataArray.length > 0) {
        console.log(
          "Sample API transit_id:",
          apiDataArray[0].transit_id,
          "(type:",
          typeof apiDataArray[0].transit_id,
          ")"
        );
      }
      if (csvData.length > 0) {
        console.log(
          "Sample CSV transit_id:",
          csvData[0].transit_id,
          "(type:",
          typeof csvData[0].transit_id,
          ")"
        );
      }

      // Combinar dados da API (predições) com dados do CSV
      const mappedRows = apiDataArray
        .map((apiItem: any) => {
          // Normalize transit_id for comparison (trim whitespace and convert to string)
          const apiTransitId = String(apiItem.transit_id).trim();

          // Encontrar a linha correspondente no CSV pelo transit_id
          const csvRow = csvData.find(
            (row) => String(row.transit_id).trim() === apiTransitId
          );

          if (!csvRow) {
            console.warn(
              `Linha não encontrada no CSV para transit_id: '${apiItem.transit_id}' (normalized: '${apiTransitId}')`
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
            pl_radius: csvRow.pl_radius || 0,
            st_eff_temp: csvRow.st_eff_temp || 0,
            st_radius: csvRow.st_radius || 0,
          };
        })
        .filter((row) => row !== null); // Remove linhas nulas

      console.log("Successfully mapped:", mappedRows.length, "rows");
      console.log("Lost rows:", apiDataArray.length - mappedRows.length);

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
        title: "Classification complete!",
        description: `${mappedRows.length} objects classified successfully.`,
      });
    } catch (error) {
      console.error("Classification error:", error);
      toast({
        title: "Classification error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the file.",
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
        title: "Invalid page",
        description: `Please enter a number between 1 and ${totalPages}`,
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    if (!results || !results.rows || results.rows.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no results to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // CSV headers
      const headers = [
        "ID",
        "Classification",
        "Confidence (%)",
        "Orbital Period (days)",
        "Transit Duration (h)",
        "Radius (R⊕)",
        "Stellar Temp. (K)",
        "Stellar Radius (R☉)",
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
          row.pl_radius.toFixed(2),
          row.st_eff_temp.toFixed(0),
          row.st_radius.toFixed(2),
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
        title: "Export complete!",
        description: `${results.rows.length} results exported to ${filename}`,
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export error",
        description: "Could not export the results.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExampleCSV = () => {
    try {
      // Realistic example data
      const exampleData = [
        {
          transit_id: "KOI-001.01",
          pl_period: 10.85,
          pl_transit_duration: 2.8,
          pl_radius: 1.05,
          st_eff_temp: 5750.0,
          st_radius: 1.02,
        },
        {
          transit_id: "TESS-123.02",
          pl_period: 3.14,
          pl_transit_duration: 1.5,
          pl_radius: 2.1,
          st_eff_temp: 6100.0,
          st_radius: 1.35,
        },
        {
          transit_id: "K2-42.01",
          pl_period: 365.25,
          pl_transit_duration: 6.2,
          pl_radius: 0.95,
          st_eff_temp: 5778.0,
          st_radius: 1.0,
        },
      ];

      // Gerar CSV
      const headers = [
        "transit_id",
        "pl_period",
        "pl_transit_duration",
        "pl_radius",
        "st_eff_temp",
        "st_radius",
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
        title: "Example CSV downloaded!",
        description: "Use this file as a template for your analyses.",
      });
    } catch (error) {
      console.error("Error generating example CSV:", error);
      toast({
        title: "Error",
        description: "Could not generate the example CSV.",
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
      <main className="container pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Exoplanet Classification
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Upload your CSV and classify candidates using our Specttra model
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* About the Model */}
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
                    {modelInfo.name || "About Specttra Model"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {modelInfo.description ||
                      "Machine Learning model trained with space mission data"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.roc_auc?.toFixed(2) || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ROC-AUC Score
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Excellent discrimination capability
                      </p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.accuracy
                          ? `${(modelInfo.metrics.accuracy * 100).toFixed(0)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        High prediction precision
                      </p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics?.f1_score
                          ? `${(modelInfo.metrics.f1_score * 100).toFixed(1)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        F1-Score
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ideal balance
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
                  Data Upload
                </CardTitle>
                <CardDescription>
                  Upload your CSV or Parquet file with transit features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">CSV/Parquet File</Label>
                  <div className="flex gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.parquet"
                      onChange={handleFileChange}
                      className="cursor-pointer flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "/src/pages/dados_exemplo.csv"
                          );
                          const csvText = await response.text();
                          const blob = new Blob([csvText], {
                            type: "text/csv",
                          });
                          const file = new File([blob], "dados_exemplo.csv", {
                            type: "text/csv",
                          });

                          // Simular o evento de mudança de arquivo
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          const inputElement = document.getElementById(
                            "file"
                          ) as HTMLInputElement;
                          if (inputElement) {
                            inputElement.files = dataTransfer.files;
                            handleFileChange({
                              target: { files: dataTransfer.files },
                            } as any);
                          }
                        } catch (error) {
                          toast({
                            title: "Error loading example",
                            description: "Could not load the example CSV file.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="whitespace-nowrap">
                      <FileText className="h-4 w-4 mr-2" />
                      Use Example
                    </Button>
                  </div>
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
                      Required CSV Columns
                    </h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <HelpCircle className="h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Info className="h-6 w-6 text-primary" />
                            CSV Structure for Classification
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            Your CSV file must contain the following columns
                            with planetary transit data. Download the example
                            file to get started quickly.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div className="grid gap-4">
                            {/* Transit ID */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Identifier
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    transit_id
                                  </h4>
                                </div>
                                <Badge>Text</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Unique identifier of the candidate (e.g.:
                                "K00001.01", "TESS-123", etc.)
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: "KOI-001", "K2-42b", "TOI-700"
                              </div>
                            </div>

                            {/* Planet Period */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Orbital Period
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_period
                                  </h4>
                                </div>
                                <Badge>Numeric</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Orbital period of the planet in days. Time the
                                planet takes to complete one orbit.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: 365.25 (days) | Unit: days
                              </div>
                            </div>

                            {/* Transit Duration */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Transit Duration
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_transit_duration
                                  </h4>
                                </div>
                                <Badge>Numeric</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Transit duration in hours. Time the planet takes
                                to cross the stellar disk.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: 3.2 (hours) | Unit: hours
                              </div>
                            </div>

                            {/* Planet Radius */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Planetary Radius
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    pl_radius
                                  </h4>
                                </div>
                                <Badge>Numeric</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Planet radius in Earth radii (R⊕). Earth = 1.0
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: 1.0 (Earth radii) | Earth = 1.0,
                                Jupiter ≈ 11.2
                              </div>
                            </div>

                            {/* Stellar Effective Temperature */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Stellar Temperature
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    st_eff_temp
                                  </h4>
                                </div>
                                <Badge>Numeric</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Effective temperature of the host star in
                                Kelvin.
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: 5778 (K) | Sun = 5778K
                              </div>
                            </div>

                            {/* Stellar Radius */}
                            <div className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    Stellar Radius
                                  </Badge>
                                  <h4 className="font-semibold text-lg">
                                    st_radius
                                  </h4>
                                </div>
                                <Badge>Numeric</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Radius of the host star in solar radii (R☉). Sun
                                = 1.0
                              </p>
                              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                                Example: 1.0 (solar radii) | Sun = 1.0
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={handleDownloadExampleCSV}
                              className="flex-1 gap-2">
                              <Download className="h-4 w-4" />
                              Download Example CSV
                            </Button>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Important Tips
                            </h5>
                            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                              <li>
                                All columns are required for the model to work
                              </li>
                              <li>
                                Numeric values must use dot (.) as decimal
                                separator
                              </li>
                              <li>
                                The file must be in CSV format with comma
                                separator
                              </li>
                              <li>
                                Make sure there are no empty or invalid values
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
                      "pl_radius",
                      "st_eff_temp",
                      "st_radius",
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
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          {csvData.length} records loaded • Review before
                          classifying
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
                        Change File
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {csvData.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Records
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.keys(csvData[0] || {}).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Columns
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {((file?.size || 0) / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Size
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.ceil(csvData.length / previewItemsPerPage)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pages
                        </div>
                      </div>
                    </div>

                    {/* Preview Table */}
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

                    {/* Preview Pagination */}
                    {csvData.length > previewItemsPerPage && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {(previewPage - 1) * previewItemsPerPage + 1}{" "}
                          to{" "}
                          {Math.min(
                            previewPage * previewItemsPerPage,
                            csvData.length
                          )}{" "}
                          of {csvData.length} records
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
                            Page {previewPage} of{" "}
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
                Classify with Specttra
              </Button>
            )}

            {isProcessing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-muted/30 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-base font-medium mb-2">
                      Processing data...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Classifying your exoplanet candidates with Specttra model
                    </p>
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
                        Classification Results
                      </CardTitle>
                      <CardDescription>
                        {getFilteredResults().length} of {results.total} objects{" "}
                        {filterPrediction !== "all" &&
                          `(filtered by ${filterPrediction})`}
                      </CardDescription>
                    </div>

                    {/* View toggle */}
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        Table
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
                  {/* Dynamic Summary */}
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

                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <Select
                      value={filterPrediction}
                      onValueChange={(value) => {
                        setFilterPrediction(value);
                        setCurrentPage(1);
                      }}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Filter by classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PLANETA CONFIRMADO">
                          Confirmed Planet
                        </SelectItem>
                        <SelectItem value="CANDIDATO FORTE">
                          Strong Candidate
                        </SelectItem>
                        <SelectItem value="CANDIDATO FRACO">
                          Weak Candidate
                        </SelectItem>
                        <SelectItem value="FALSO POSITIVO">
                          False Positive
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
                        Clear filter
                      </Button>
                    )}
                  </div>

                  {viewMode === "table" && (
                    <div className="border rounded-lg">
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">ID</TableHead>
                              <TableHead>Period (d)</TableHead>
                              <TableHead>Duration (h)</TableHead>
                              <TableHead>Radius (R⊕)</TableHead>
                              <TableHead>St. Temp. (K)</TableHead>
                              <TableHead>St. Radius (R☉)</TableHead>
                              <TableHead>Classification</TableHead>
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
                                    {row.pl_radius.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {row.st_eff_temp.toFixed(0)}
                                  </TableCell>
                                  <TableCell>
                                    {row.st_radius.toFixed(2)}
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
                                    Exoplanet candidate
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
                                    Period:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_period.toFixed(2)} days
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Duration:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_transit_duration.toFixed(2)} h
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Radius:
                                  </span>
                                  <div className="font-semibold">
                                    {row.pl_radius.toFixed(2)} R⊕
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    St. Temp.:
                                  </span>
                                  <div className="font-semibold">
                                    {row.st_eff_temp.toFixed(0)} K
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    St. Radius:
                                  </span>
                                  <div className="font-semibold">
                                    {row.st_radius.toFixed(2)} R☉
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages} (
                        {getFilteredResults().length} results)
                      </div>

                      <div className="flex items-center gap-2">
                        {/* First Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          title="First page">
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          title="Previous page">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Input */}
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
                            title="Enter page number"
                          />
                          <span className="text-sm text-muted-foreground">
                            / {totalPages}
                          </span>
                        </form>

                        {/* Next Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          title="Next page">
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          title="Last page">
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Discrete Threshold Control */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Advanced Settings
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 p-4 border rounded-lg bg-muted/30 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">
                            Confidence Threshold
                          </Label>
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
                          Adjusts the confidence level for result classification
                        </p>
                      </div>

                      {/* Compact legend */}
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
                            STRONG
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
                            WEAK
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
                    Export Results (CSV)
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
