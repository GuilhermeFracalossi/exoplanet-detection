import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Upload,
  Sparkles,
  TrendingUp,
  Settings,
  CheckCircle2,
  FileText,
  AlertCircle,
  BarChart3,
  Info,
  Download,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FineTuning = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showHyperparams, setShowHyperparams] = useState(false);
  const [hyperparams, setHyperparams] = useState({
    n_estimators: 200,
    max_depth: 10,
    learning_rate: 0.1,
    min_samples_split: 2,
    min_samples_leaf: 1,
  });
  const [trainingResults, setTrainingResults] = useState<any>(null);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Buscar métricas reais da API
    fetch("http://localhost:8000/api/v1/metrics")
      .then((res) => res.json())
      .then((data) => {
        setModelInfo(data.modelos_internos?.[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar métricas:", err);
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationStatus("idle");
      setTrainingResults(null);
    }
  };

  const validateCSV = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    // Simular validação
    setTimeout(() => {
      setIsValidating(false);
      setValidationStatus("valid");
      toast({
        title: "CSV Validado!",
        description: "Arquivo válido e pronto para treinamento.",
      });
    }, 2000);
  };

  const handleTrain = async () => {
    if (!file || validationStatus !== "valid") {
      toast({
        title: "Erro",
        description: "Por favor, valide o CSV primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simular progresso de treinamento
    const progressInterval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simular treinamento
    setTimeout(() => {
      clearInterval(progressInterval);
      setTrainingProgress(100);

      // Resultados simulados
      setTrainingResults({
        accuracy: 0.956,
        precision: 0.943,
        recall: 0.912,
        f1_score: 0.927,
        roc_auc: 0.982,
        pr_auc: 0.968,
      });

      // Feature importance simulada
      setFeatureImportance([
        { feature: "pl_transit_depth", importance: 0.245 },
        { feature: "pl_period", importance: 0.198 },
        { feature: "st_eff_temp", importance: 0.142 },
        { feature: "pl_radius", importance: 0.128 },
        { feature: "st_radius", importance: 0.089 },
        { feature: "pl_transit_duration", importance: 0.076 },
        { feature: "pl_insolation_flux", importance: 0.065 },
        { feature: "st_logg", importance: 0.057 },
      ]);

      setIsTraining(false);

      toast({
        title: "Treinamento Concluído!",
        description: "Modelo treinado com sucesso. Confira as métricas.",
      });
    }, 5500);
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl mb-2">
                  Fine Tuning Premium
                </CardTitle>
                <CardDescription className="text-lg">
                  Aprimore o modelo Specttra com seus próprios dados rotulados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recursos Premium
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Upload de dados com rótulos (target)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>
                          Concatenação automática com dataset base Specttra
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Ajuste de hiperparâmetros</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Métricas detalhadas e curvas ROC/PR</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Importância de features (explicabilidade)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Salvar e exportar modelos personalizados</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold">
                      {loading
                        ? "Carregando métricas..."
                        : "Métricas de Performance"}
                    </h3>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Carregando dados do modelo...
                        </div>
                      ) : modelInfo ? (
                        [
                          {
                            label: "Accuracy",
                            value: `${(modelInfo.Acuracia_Media * 100).toFixed(
                              1
                            )}%`,
                          },
                          {
                            label: "F1-Score",
                            value: modelInfo.F1_Planeta_Media.toFixed(2),
                          },
                          {
                            label: "ROC-AUC",
                            value: modelInfo.AUC_ROC_Media.toFixed(2),
                          },
                          {
                            label: "PR-AUC",
                            value: modelInfo.AUC_PRC_Media.toFixed(2),
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {metric.label}
                            </span>
                            <Badge variant="secondary">{metric.value}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Não foi possível carregar as métricas
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      *Métricas atuais do modelo base Specttra
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Desbloqueie o potencial completo do Specttra
                    </p>
                    <Button
                      size="lg"
                      className="text-lg px-8"
                      onClick={() => setIsPremium(true)}>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Ativar Premium
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Teste grátis por 14 dias • Cancele quando quiser
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Fine Tuning</h1>
            <Badge variant="default" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Ativo
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Personalize o modelo Specttra com seus dados rotulados
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Fluxo de Treinamento */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passo 1: Upload de Dados com Target */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload de Dados com Target
                    </div>
                  </div>
                  {validationStatus === "valid" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                </CardTitle>
                <CardDescription>
                  Carregue seu CSV com features e coluna de target (0 = Falso
                  Positivo, 1 = Planeta)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Arquivo CSV</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer mt-2"
                  />
                  {file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                {file && validationStatus === "idle" && (
                  <Button
                    onClick={validateCSV}
                    disabled={isValidating}
                    className="w-full">
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Validando CSV...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validar CSV
                      </>
                    )}
                  </Button>
                )}

                {validationStatus === "valid" && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">
                        CSV Validado com Sucesso!
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Arquivo pronto para concatenação e treinamento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Passo 2: Concatenação com Dataset Base */}
            {validationStatus === "valid" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      Concatenação de Dados
                    </CardTitle>
                    <CardDescription>
                      Seus dados serão concatenados com o dataset base Specttra
                      (Kepler, K2, TESS)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            250
                          </div>
                          <div className="text-muted-foreground">
                            Seus Dados
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-muted-foreground">
                            +
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">5,043</div>
                          <div className="text-muted-foreground">
                            Base Specttra
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-3 text-center">
                        <div className="text-3xl font-bold text-primary">
                          5,293
                        </div>
                        <div className="text-muted-foreground">
                          Total de Amostras
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Passo 3: Hiperparâmetros (Opcional) */}
            {validationStatus === "valid" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Configuração de Hiperparâmetros
                          <Badge variant="outline" className="text-xs">
                            Opcional
                          </Badge>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Use as configurações padrão ou customize os
                      hiperparâmetros do modelo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          n_estimators
                        </Label>
                        <div className="font-semibold">
                          {hyperparams.n_estimators}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          max_depth
                        </Label>
                        <div className="font-semibold">
                          {hyperparams.max_depth}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          learning_rate
                        </Label>
                        <div className="font-semibold">
                          {hyperparams.learning_rate}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          min_samples_split
                        </Label>
                        <div className="font-semibold">
                          {hyperparams.min_samples_split}
                        </div>
                      </div>
                    </div>

                    <Dialog
                      open={showHyperparams}
                      onOpenChange={setShowHyperparams}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Customizar Hiperparâmetros
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Hiperparâmetros</DialogTitle>
                          <DialogDescription>
                            Ajuste os parâmetros do modelo RandomForest/XGBoost
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="n_estimators">n_estimators</Label>
                            <Input
                              id="n_estimators"
                              type="number"
                              value={hyperparams.n_estimators}
                              onChange={(e) =>
                                setHyperparams({
                                  ...hyperparams,
                                  n_estimators: parseInt(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Número de árvores no ensemble (padrão: 200)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="max_depth">max_depth</Label>
                            <Input
                              id="max_depth"
                              type="number"
                              value={hyperparams.max_depth}
                              onChange={(e) =>
                                setHyperparams({
                                  ...hyperparams,
                                  max_depth: parseInt(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Profundidade máxima das árvores (padrão: 10)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="learning_rate">learning_rate</Label>
                            <Input
                              id="learning_rate"
                              type="number"
                              step="0.01"
                              value={hyperparams.learning_rate}
                              onChange={(e) =>
                                setHyperparams({
                                  ...hyperparams,
                                  learning_rate: parseFloat(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Taxa de aprendizado (padrão: 0.1)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="min_samples_split">
                              min_samples_split
                            </Label>
                            <Input
                              id="min_samples_split"
                              type="number"
                              value={hyperparams.min_samples_split}
                              onChange={(e) =>
                                setHyperparams({
                                  ...hyperparams,
                                  min_samples_split: parseInt(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Mínimo de amostras para dividir um nó (padrão: 2)
                            </p>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => {
                              setShowHyperparams(false);
                              toast({
                                title: "Hiperparâmetros atualizados",
                                description:
                                  "Configurações salvas com sucesso.",
                              });
                            }}>
                            Salvar Configurações
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Passo 4: Treinar Modelo */}
            {validationStatus === "valid" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      Executar Treinamento
                    </CardTitle>
                    <CardDescription>
                      Inicie o treinamento com seus dados concatenados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isTraining && !trainingResults && (
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleTrain}>
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar Treinamento
                      </Button>
                    )}

                    {isTraining && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          <span className="text-sm font-medium">
                            Treinando modelo...
                          </span>
                        </div>
                        <Progress value={trainingProgress} />
                        <p className="text-xs text-muted-foreground">
                          {trainingProgress < 30 &&
                            "Preparando dados e features..."}
                          {trainingProgress >= 30 &&
                            trainingProgress < 60 &&
                            "Treinando modelo com dados concatenados..."}
                          {trainingProgress >= 60 &&
                            trainingProgress < 90 &&
                            "Validando com cross-validation..."}
                          {trainingProgress >= 90 &&
                            "Calculando métricas finais..."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Resultados do Treinamento */}
            {trainingResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      Métricas de Machine Learning
                    </CardTitle>
                    <CardDescription>
                      Resultados do treinamento com validação cruzada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Accuracy",
                          value:
                            (trainingResults.accuracy * 100).toFixed(2) + "%",
                          color: "text-blue-600",
                        },
                        {
                          label: "Precision",
                          value: trainingResults.precision.toFixed(3),
                          color: "text-purple-600",
                        },
                        {
                          label: "Recall",
                          value: trainingResults.recall.toFixed(3),
                          color: "text-green-600",
                        },
                        {
                          label: "F1-Score",
                          value: trainingResults.f1_score.toFixed(3),
                          color: "text-orange-600",
                        },
                        {
                          label: "ROC-AUC",
                          value: trainingResults.roc_auc.toFixed(3),
                          color: "text-pink-600",
                        },
                        {
                          label: "PR-AUC",
                          value: trainingResults.pr_auc.toFixed(3),
                          color: "text-indigo-600",
                        },
                      ].map((metric) => (
                        <div
                          key={metric.label}
                          className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">
                            {metric.label}
                          </div>
                          <div className={`text-2xl font-bold ${metric.color}`}>
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Modelo Treinado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Importância de Features */}
            {featureImportance.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Importância de Features
                    </CardTitle>
                    <CardDescription>
                      Features mais relevantes para a classificação
                      (explicabilidade do modelo)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Importância</TableHead>
                          <TableHead className="w-[200px]">
                            Visualização
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {featureImportance.map((item, index) => (
                          <TableRow key={item.feature}>
                            <TableCell className="font-medium">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="ml-2">{item.feature}</span>
                            </TableCell>
                            <TableCell>
                              {(item.importance * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${item.importance * 100}%` }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Informações e Ajuda */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Sobre o Fine Tuning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  O Fine Tuning permite personalizar o modelo Specttra com seus
                  próprios dados rotulados.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Fluxo:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Upload de CSV com target</li>
                    <li>Validação automática</li>
                    <li>Concatenação com base</li>
                    <li>Treinamento do modelo</li>
                    <li>Métricas detalhadas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Colunas Esperadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Seu CSV deve conter:
                </p>
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
                    "target",
                  ].map((feature) => (
                    <Badge
                      key={feature}
                      variant={feature === "target" ? "default" : "secondary"}
                      className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-xs">
                    <strong>target:</strong> 0 = Negativo, 1 = Positivo
                  </p>
                </div>
              </CardContent>
            </Card>

            {modelInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Modelo Base Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accuracy</span>
                      <Badge variant="secondary">
                        {(modelInfo.Acuracia_Media * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">F1-Score</span>
                      <Badge variant="secondary">
                        {modelInfo.F1_Planeta_Media.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROC-AUC</span>
                      <Badge variant="secondary">
                        {modelInfo.AUC_ROC_Media.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FineTuning;
