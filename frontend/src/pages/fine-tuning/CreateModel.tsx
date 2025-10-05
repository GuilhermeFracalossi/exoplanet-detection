import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ArrowLeft,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
  Sliders,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Helper function to format model name
const formatModelName = (name: string): string => {
  // Remove "lightgbm_" prefix if present
  return name.replace(/^lightgbm_/, "");
};

const CreateModel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<
    "upload" | "config" | "training" | "complete"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [trainingStatus, setTrainingStatus] = useState("");

  const [hyperparams, setHyperparams] = useState({
    n_estimators: 1600,
    learning_rate: 0.0028,
    lambda_l1: 0.00000001,
    lambda_l2: 0.2,
    num_leaves: 350,
    max_depth: 10,
    feature_fraction: 0.88,
    bagging_fraction: 0.53,
    bagging_freq: 3,
    min_child_samples: 16,
  });

  const [trainedModel, setTrainedModel] = useState<any>(null);

  const validateTrainingCSV = async (file: File): Promise<boolean> => {
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
            "pl_period",
            "pl_transit_duration",
            "pl_radius",
            "st_eff_temp",
            "st_radius",
            "isplanet", // Target column obrigatória (lowercase para comparação)
          ];

          const missingColumns = requiredColumns.filter(
            (col) => !columns.includes(col.toLowerCase())
          );

          console.log("Missing columns:", missingColumns);

          if (missingColumns.length > 0) {
            toast({
              title: "Invalid CSV",
              description: `Missing required columns: ${missingColumns.join(
                ", "
              )}`,
              variant: "destructive",
            });
            resolve(false);
          } else {
            toast({
              title: "CSV Validated ✓",
              description:
                "All required columns found, including isPlanet target column.",
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validar CSV antes de aceitar
      const isValid = await validateTrainingCSV(selectedFile);

      if (isValid) {
        setFile(selectedFile);
        toast({
          title: "File uploaded",
          description: `${selectedFile.name} ready for training.`,
        });
      } else {
        // Limpar o input se o arquivo for inválido
        e.target.value = "";
        setFile(null);
      }
    }
  };

  const handleStartTraining = async () => {
    if (!file) {
      toast({
        title: "Missing information",
        description: "Please upload training data.",
        variant: "destructive",
      });
      return;
    }

    setStep("training");
    setTrainingStatus("Preparing data and training model...");

    try {
      // Prepare FormData with file and hyperparameters
      const formData = new FormData();
      formData.append("file", file);

      // Append all hyperparameters individually
      formData.append("n_estimators", hyperparams.n_estimators.toString());
      formData.append("learning_rate", hyperparams.learning_rate.toString());
      formData.append("lambda_l1", hyperparams.lambda_l1.toString());
      formData.append("lambda_l2", hyperparams.lambda_l2.toString());
      formData.append("num_leaves", hyperparams.num_leaves.toString());
      formData.append("max_depth", hyperparams.max_depth.toString());
      formData.append(
        "feature_fraction",
        hyperparams.feature_fraction.toString()
      );
      formData.append(
        "bagging_fraction",
        hyperparams.bagging_fraction.toString()
      );
      formData.append("bagging_freq", hyperparams.bagging_freq.toString());
      formData.append(
        "min_child_samples",
        hyperparams.min_child_samples.toString()
      );

      setTrainingStatus("Training model with your data...");

      const response = await fetch("http://localhost:8000/api/v1/train", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Training failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      console.log("Training response:", data); // Debug log

      setTrainingStatus("Training completed successfully!");

      // Extract model name from path
      // Path format: ".../models/model_20251005_131552/lightgbm_model.pkl"
      const pathParts = data.model_path.split(/[\\/]/);
      const modelFolderName = pathParts[pathParts.length - 2]; // Gets "model_20251005_131552"

      // Build trained model object from API response
      const trainedModelData = {
        id: modelFolderName,
        name: modelFolderName, // Will be formatted in display
        description: "Custom trained exoplanet detection model",
        created_at: new Date().toISOString(),
        metrics: {
          accuracy: data.metrics.accuracy,
          roc_auc: data.metrics.auc_roc,
          prc_auc: data.metrics.auc_prc,
          recall_planet: data.metrics.recall_planet,
          precision_planet: data.metrics.precision_planet,
          f1_planet: data.metrics.f1_score_planet,
        },
        hyperparameters: hyperparams,
        model_path: data.model_path,
        metadata_path: data.metadata_path,
        training_samples: 0, // Not provided in response
        status: "active",
      };

      console.log("Trained model data:", trainedModelData); // Debug log

      setTrainedModel(trainedModelData);
      setStep("complete");

      console.log("Step changed to: complete"); // Debug log

      toast({
        title: "Training complete!",
        description: data.message || "Your custom model is ready to use.",
      });
    } catch (error) {
      console.error("Training error:", error);
      toast({
        title: "Training failed",
        description: "An error occurred during model training.",
        variant: "destructive",
      });
      setStep("config");
    }
  };

  const handleUpdateHyperparam = (key: string, value: number) => {
    setHyperparams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            Create Custom Model
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Train a personalized exoplanet detection model with your data
          </p>
        </motion.div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Training Data
                </CardTitle>
                <CardDescription>
                  Upload your CSV file with features and isPlanet labels. The
                  model name will be automatically generated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="trainingFile">CSV File *</Label>
                  <Input
                    id="trainingFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Required Columns
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
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
                    <Badge variant="default">isPlanet</Badge>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                    <p className="text-xs text-blue-900 dark:text-blue-100 flex items-start gap-2">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        The <strong>isPlanet</strong> column should contain 0
                        (false positive) or 1 (confirmed planet). Your data will
                        be concatenated with our base Specttra dataset for
                        training.
                      </span>
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setStep("config")}
                  disabled={!file}
                  size="lg"
                  className="w-full">
                  Configure Hyperparameters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {step === "config" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Hyperparameters Configuration
                </CardTitle>
                <CardDescription>
                  Adjust LightGBM parameters for your custom model (based on
                  Specttra)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-4">
                      <Sliders className="h-4 w-4 mr-2" />
                      Edit Hyperparameters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[700px] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sliders className="h-5 w-5" />
                        Configure Hyperparameters
                      </DialogTitle>
                      <DialogDescription>
                        Fine-tune LightGBM parameters for your custom model.
                        Adjust sliders and see real-time updates.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="regularization">
                          Regularization
                        </TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>

                      {/* Basic Parameters */}
                      <TabsContent value="basic" className="space-y-6 py-4">
                        {/* n_estimators */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Number of Trees
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.n_estimators}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.n_estimators]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam("n_estimators", value[0])
                            }
                            min={100}
                            max={3000}
                            step={100}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            More trees improve performance but increase training
                            time. Default: 1600
                          </p>
                        </div>

                        {/* learning_rate */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Learning Rate
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.learning_rate.toFixed(4)}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.learning_rate * 1000]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "learning_rate",
                                value[0] / 1000
                              )
                            }
                            min={1}
                            max={50}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Controls how much each tree contributes. Lower =
                            more conservative. Default: 0.0028
                          </p>
                        </div>

                        {/* max_depth */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Maximum Depth
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.max_depth}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.max_depth]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam("max_depth", value[0])
                            }
                            min={3}
                            max={20}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Maximum tree depth. Higher values can lead to
                            overfitting. Default: 10
                          </p>
                        </div>

                        {/* num_leaves */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Number of Leaves
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.num_leaves}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.num_leaves]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam("num_leaves", value[0])
                            }
                            min={15}
                            max={512}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Maximum number of leaves per tree. Default: 350
                          </p>
                        </div>
                      </TabsContent>

                      {/* Regularization Parameters */}
                      <TabsContent
                        value="regularization"
                        className="space-y-6 py-4">
                        {/* lambda_l1 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              L1 Regularization (λ₁)
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.lambda_l1.toExponential(2)}
                            </Badge>
                          </div>
                          <Slider
                            value={[
                              Math.log10(hyperparams.lambda_l1 + 1e-10) + 10,
                            ]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "lambda_l1",
                                Math.pow(10, value[0] - 10)
                              )
                            }
                            min={0}
                            max={10}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            L1 regularization to prevent overfitting. Very small
                            values recommended. Default: 1e-8
                          </p>
                        </div>

                        {/* lambda_l2 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              L2 Regularization (λ₂)
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.lambda_l2.toFixed(3)}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.lambda_l2 * 100]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "lambda_l2",
                                value[0] / 100
                              )
                            }
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            L2 regularization to prevent overfitting. Default:
                            0.2
                          </p>
                        </div>

                        {/* min_child_samples */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Minimum Child Samples
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.min_child_samples}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.min_child_samples]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "min_child_samples",
                                value[0]
                              )
                            }
                            min={5}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum samples required in a leaf node. Higher
                            prevents overfitting. Default: 16
                          </p>
                        </div>
                      </TabsContent>

                      {/* Advanced Parameters */}
                      <TabsContent value="advanced" className="space-y-6 py-4">
                        {/* feature_fraction */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Feature Fraction
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.feature_fraction.toFixed(2)}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.feature_fraction * 100]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "feature_fraction",
                                value[0] / 100
                              )
                            }
                            min={10}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Fraction of features used per tree. Helps prevent
                            overfitting. Default: 0.88
                          </p>
                        </div>

                        {/* bagging_fraction */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Bagging Fraction
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.bagging_fraction.toFixed(2)}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.bagging_fraction * 100]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam(
                                "bagging_fraction",
                                value[0] / 100
                              )
                            }
                            min={10}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Fraction of training data used per iteration.
                            Default: 0.53
                          </p>
                        </div>

                        {/* bagging_freq */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              Bagging Frequency
                            </Label>
                            <Badge variant="secondary">
                              {hyperparams.bagging_freq}
                            </Badge>
                          </div>
                          <Slider
                            value={[hyperparams.bagging_freq]}
                            onValueChange={(value) =>
                              handleUpdateHyperparam("bagging_freq", value[0])
                            }
                            min={0}
                            max={20}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Frequency for bagging. 0 means no bagging. Default:
                            3
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Trees
                    </div>
                    <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
                      {hyperparams.n_estimators}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Learning Rate
                    </div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {hyperparams.learning_rate.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Max Depth
                    </div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {hyperparams.max_depth}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Leaves
                    </div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {hyperparams.num_leaves}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Feature Frac
                    </div>
                    <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                      {(hyperparams.feature_fraction * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      L2 Reg
                    </div>
                    <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                      {hyperparams.lambda_l2.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("upload")}
                    className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleStartTraining} className="flex-1">
                    Start Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Training */}
        {step === "training" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 animate-pulse" />
                  Training in Progress
                </CardTitle>
                <CardDescription>
                  Your model is being trained with the Specttra base dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-base font-medium mb-2">{trainingStatus}</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes depending on your dataset
                    size...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && trainedModel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6">
            <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                  Training Complete!
                </CardTitle>
                <CardDescription>
                  Your custom model has been successfully trained and is ready
                  to use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-background rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {trainedModel.metrics.roc_auc.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ROC-AUC
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {trainedModel.metrics.prc_auc.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PRC-AUC
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(trainedModel.metrics.accuracy * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Accuracy
                      </div>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg p-4 mt-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Planet Class Metrics
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Precision:</span>
                        <span className="font-semibold">
                          {trainedModel.metrics.precision_planet.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recall:</span>
                        <span className="font-semibold">
                          {trainedModel.metrics.recall_planet.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>F1 Score:</span>
                        <span className="font-semibold">
                          {trainedModel.metrics.f1_planet.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/fine-tuning")}
                    className="flex-1">
                    Back to Models
                  </Button>
                  <Button
                    onClick={() =>
                      navigate(`/fine-tuning/classify/${trainedModel.id}`, {
                        state: { modelData: trainedModel },
                      })
                    }
                    className="flex-1">
                    Use Model Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CreateModel;
