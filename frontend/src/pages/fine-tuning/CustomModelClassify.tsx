import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
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
  Info,
  X,
  ArrowLeft,
  Sparkles,
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CustomModelClassify = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState([0.5]);
  const [classificationThreshold, setClassificationThreshold] = useState([0.7]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingModelInfo, setLoadingModelInfo] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterPrediction, setFilterPrediction] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [pageInput, setPageInput] = useState<string>("1");

  const [csvData, setCsvData] = useState<any[]>([]);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewItemsPerPage] = useState(10);

  useEffect(() => {
    fetchModelInfo();
  }, [modelId]);

  const fetchModelInfo = async () => {
    try {
      setLoadingModelInfo(true);

      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:8000/api/v1/fine-tuning/models/${modelId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setModelInfo(data.model);

      // Mock data
      setTimeout(() => {
        setModelInfo({
          id: modelId,
          name: "Kepler Extended Model",
          description: "Model trained with additional Kepler mission data",
          created_at: "2025-10-01T10:30:00Z",
          metrics: {
            roc_auc: 0.9821,
            prc_auc: 0.9654,
            accuracy: 0.9245,
            f1_planet: 0.8956,
          },
          hyperparameters: {
            n_estimators: 1500,
            learning_rate: 0.003,
            max_depth: 10,
            num_leaves: 256,
          },
          training_samples: 15420,
          status: "active",
        });
        setLoadingModelInfo(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching model info:", error);
      toast({
        title: "Error loading model",
        description: "Could not load model information.",
        variant: "destructive",
      });
      setLoadingModelInfo(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      try {
        const data = await parseCSV(selectedFile);
        setCsvData(data);
        setShowDataPreview(true);
        setPreviewPage(1);

        toast({
          title: "File loaded",
          description: `${data.length} records found. Review the data before classifying.`,
        });
      } catch (error) {
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
            row[header] = isNaN(Number(value)) ? value : Number(value);
          });
          return row;
        });

        resolve(data);
      };

      reader.onerror = () => {
        reject(new Error("Error reading CSV file"));
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
          "pl_radius",
          "st_eff_temp",
          "st_radius",
        ];

        const missingColumns = requiredColumns.filter(
          (col) => !columns.includes(col)
        );

        if (missingColumns.length > 0) {
          toast({
            title: "Validation Error",
            description: `Missing columns: ${missingColumns.join(", ")}`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          toast({
            title: "Validation OK",
            description: "All required columns were found!",
          });
          resolve(true);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the CSV file.",
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
    formData.append("model_id", modelId || ""); // Add custom model ID
    formData.append("threshold", threshold[0].toString());

    // TODO: Replace with actual API endpoint
    // const response = await fetch(`http://localhost:8000/api/v1/fine-tuning/predict/${modelId}`, {
    //   method: "POST",
    //   body: formData,
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // });

    // Mock API response
    const response = await fetch("http://localhost:8000/api/v1/predict", {
      method: "POST",
      body: formData,
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
      const isValid = await validateCSVColumns(file);

      if (!isValid) {
        setIsProcessing(false);
        return;
      }

      const apiData = await sendCSVToAPI(file);
      const csvData = await parseCSV(file);
      const apiDataArray = Array.isArray(apiData) ? apiData : [apiData];

      const mappedRows = apiDataArray
        .map((apiItem: any) => {
          const csvRow = csvData.find(
            (row) => row.transit_id === apiItem.transit_id
          );

          if (!csvRow) {
            console.warn(
              `Row not found in CSV for transit_id: ${apiItem.transit_id}`
            );
            return null;
          }

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
        .filter((row) => row !== null);

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
        description: `${mappedRows.length} objects classified successfully with your custom model.`,
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

  const getDynamicPrediction = (confidence: number): string => {
    const thresholdValue = classificationThreshold[0];

    if (confidence >= thresholdValue) {
      return "CONFIRMED PLANET";
    } else if (confidence >= thresholdValue - 0.15) {
      return "STRONG CANDIDATE";
    } else if (confidence >= thresholdValue - 0.3) {
      return "WEAK CANDIDATE";
    } else {
      return "FALSE POSITIVE";
    }
  };

  const getDynamicSummary = () => {
    if (!results) return {};

    const summary: any = {
      "CONFIRMED PLANET": 0,
      "STRONG CANDIDATE": 0,
      "WEAK CANDIDATE": 0,
      "FALSE POSITIVE": 0,
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

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `custom_model_${modelId}_results_${timestamp}.csv`;

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

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "CONFIRMED PLANET":
        return "default";
      case "STRONG CANDIDATE":
        return "secondary";
      case "WEAK CANDIDATE":
        return "outline";
      case "FALSE POSITIVE":
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
          <Button
            variant="ghost"
            onClick={() => navigate("/fine-tuning")}
            className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Models
          </Button>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            {loadingModelInfo
              ? "Loading..."
              : modelInfo?.name || "Custom Model"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {loadingModelInfo
              ? "Loading model information..."
              : modelInfo?.description ||
                "Classify exoplanet candidates with your custom model"}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Model Info */}
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
                    Custom Model Information
                  </CardTitle>
                  <CardDescription className="text-base">
                    Trained with {modelInfo.training_samples.toLocaleString()}{" "}
                    samples on{" "}
                    {new Date(modelInfo.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {modelInfo.metrics.roc_auc.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ROC-AUC
                      </div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {modelInfo.metrics.prc_auc.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        PRC-AUC
                      </div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {(modelInfo.metrics.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {modelInfo.metrics.f1_planet.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        F1 Planet
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upload Section - Similar to Classificacao.tsx but simplified */}
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
                  Upload your CSV file with transit features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">CSV File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
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
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Required CSV Columns
                  </h4>
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

            {/* Data Preview - Simplified version */}
            {showDataPreview && csvData.length > 0 && !results && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Data Preview
                      </CardTitle>
                      <CardDescription>
                        {csvData.length} records loaded
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
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ready to classify with your custom model
                  </p>
                </CardContent>
              </Card>
            )}

            {file && !isProcessing && !results && showDataPreview && (
              <Button onClick={handleClassify} size="lg" className="w-full">
                Classify with Custom Model
              </Button>
            )}

            {isProcessing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      <span className="text-sm font-medium">
                        Processing data with your custom model...
                      </span>
                    </div>
                    <Progress value={66} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section - Reuse from Classificacao.tsx */}
            {results && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Classification Results
                      </CardTitle>
                      <CardDescription>
                        {getFilteredResults().length} of {results.total} objects
                        {filterPrediction !== "all" &&
                          ` (filtered by ${filterPrediction})`}
                      </CardDescription>
                    </div>

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
                        <SelectItem value="CONFIRMED PLANET">
                          Confirmed Planet
                        </SelectItem>
                        <SelectItem value="STRONG CANDIDATE">
                          Strong Candidate
                        </SelectItem>
                        <SelectItem value="WEAK CANDIDATE">
                          Weak Candidate
                        </SelectItem>
                        <SelectItem value="FALSE POSITIVE">
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

                  {/* Table View */}
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

                  {/* Card View */}
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
                                  <CardDescription className="text-xs">
                                    Transit Candidate
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge
                                    variant={getPredictionColor(
                                      dynamicPrediction
                                    )}>
                                    {dynamicPrediction}
                                  </Badge>
                                  <span className="text-sm font-semibold">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}>
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

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
                            className="w-16 h-9 text-center"
                          />
                          <span className="text-sm text-muted-foreground">
                            / {totalPages}
                          </span>
                        </form>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}>
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

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

export default CustomModelClassify;
