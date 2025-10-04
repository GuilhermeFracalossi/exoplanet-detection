import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Upload,
  Sparkles,
  TrendingUp,
  Settings,
  Save,
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
import { useToast } from "@/hooks/use-toast";

const FineTuning = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isEditingHyperparams, setIsEditingHyperparams] = useState(false);
  const [hyperparams, setHyperparams] = useState({
    n_estimators: 200,
    max_depth: 10,
    learning_rate: 0.1,
    k_fold: 5,
  });
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Buscar métricas reais da API (mesmo formato do Index.tsx)
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload com Target
                </CardTitle>
                <CardDescription>
                  Carregue CSV com coluna de rótulo (label/target)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste seu arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV ou Parquet • Máx. 100MB
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuração de Dados</CardTitle>
                <CardDescription>
                  Seus dados serão automaticamente concatenados com o dataset
                  base Specttra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">
                    Resumo da Concatenação
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Seus dados</div>
                      <div className="font-semibold">—</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Base Specttra</div>
                      <div className="font-semibold">5,043</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Total após upload
                      </div>
                      <div className="font-semibold text-primary">5,043+</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Hiperparâmetros
                </CardTitle>
                <CardDescription>
                  Ajuste fino dos parâmetros do modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="space-y-1">
                    <Label>n_estimators</Label>
                    <div className="text-muted-foreground">
                      {hyperparams.n_estimators}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>max_depth</Label>
                    <div className="text-muted-foreground">
                      {hyperparams.max_depth}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>learning_rate</Label>
                    <div className="text-muted-foreground">
                      {hyperparams.learning_rate}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>k-fold CV</Label>
                    <div className="text-muted-foreground">
                      {hyperparams.k_fold}
                    </div>
                  </div>
                </div>

                <Dialog
                  open={isEditingHyperparams}
                  onOpenChange={setIsEditingHyperparams}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Hiperparâmetros
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Hiperparâmetros</DialogTitle>
                      <DialogDescription>
                        Ajuste os parâmetros do modelo para otimizar o
                        treinamento
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
                          Número de árvores no ensemble
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
                          Profundidade máxima de cada árvore
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
                          Taxa de aprendizado do modelo
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="k_fold">k-fold CV</Label>
                        <Input
                          id="k_fold"
                          type="number"
                          value={hyperparams.k_fold}
                          onChange={(e) =>
                            setHyperparams({
                              ...hyperparams,
                              k_fold: parseInt(e.target.value),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Número de folds para cross-validation
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsEditingHyperparams(false);
                          toast({
                            title: "Hiperparâmetros atualizados",
                            description:
                              "As configurações foram salvas com sucesso.",
                          });
                        }}>
                        Salvar Configurações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full">
              <TrendingUp className="h-5 w-5 mr-2" />
              Treinar Modelo
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experimentos Salvos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground text-center py-8">
                  Nenhum experimento ainda.
                  <br />
                  Treine seu primeiro modelo!
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features Esperadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Certifique-se de incluir:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "orbital_period",
                    "transit_duration",
                    "planet_radius",
                    "depth_ppm",
                    "snr",
                    "impact_parameter",
                    "stellar_radius",
                    "stellar_mass",
                    "teff_k",
                  ].map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FineTuning;
