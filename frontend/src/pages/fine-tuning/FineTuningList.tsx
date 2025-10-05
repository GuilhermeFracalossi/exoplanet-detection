import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Helper function to format model name
const formatModelName = (name: string): string => {
  // Remove "lightgbm_" prefix if present
  return name.replace(/^lightgbm_/, "");
};

interface CustomModel {
  id: string;
  name: string;
  description: string;
  created_at: string;
  metrics: {
    roc_auc: number;
    prc_auc: number;
    accuracy: number;
    f1_planet: number;
  };
  hyperparameters: {
    n_estimators: number;
    learning_rate: number;
    max_depth: number;
    num_leaves: number;
  };
  training_samples: number;
  status: "active" | "training" | "error";
}

const FineTuningList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [models, setModels] = useState<CustomModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/v1/models", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();

      // Map API response to component structure
      const mappedModels =
        data.models?.map((model: any) => {
          const metadata = model.metadata || {};
          const params = metadata.params || {};
          const metrics = metadata.metrics || {};

          // Extract date from created_at format "20251005_131552"
          const createdAtStr = metadata.created_at || "";
          let formattedDate = new Date().toISOString();
          if (createdAtStr && createdAtStr.length >= 8) {
            const year = createdAtStr.substring(0, 4);
            const month = createdAtStr.substring(4, 6);
            const day = createdAtStr.substring(6, 8);
            formattedDate = `${year}-${month}-${day}T00:00:00Z`;
          }

          return {
            id: model.model_name || `model-${Date.now()}`,
            name: formatModelName(
              metadata.model_name || model.model_name || "Custom Model"
            ),
            description: "Custom trained exoplanet detection model",
            created_at: formattedDate,
            model_path: model.model_path || "", // Add model_path from API response
            metrics: {
              roc_auc: metrics.auc_roc || 0,
              prc_auc: metrics.auc_prc || 0,
              accuracy: metrics.accuracy || 0,
              f1_planet: metrics.f1_score_planet || 0,
            },
            hyperparameters: {
              n_estimators: params.n_estimators || 0,
              learning_rate: params.learning_rate || 0,
              max_depth: params.max_depth || 0,
              num_leaves: params.num_leaves || 0,
              feature_fraction: params.feature_fraction || 0,
              bagging_fraction: params.bagging_fraction || 0,
            },
            training_samples: 0, // Not provided in API response
            status: "active" as const,
          };
        }) || [];

      setModels(mappedModels);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error loading models",
        description: "Could not load your custom models.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                Fine Tuning
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Create and manage your custom exoplanet detection models
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/fine-tuning/create")}
              className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Model
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : models.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <Card className="border-dashed border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No custom models yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Create your first custom model to start training with your
                      own data and improve exoplanet detection accuracy
                    </p>
                    <Button
                      onClick={() => navigate("/fine-tuning/create")}
                      className="gap-2">
                      <Plus className="h-5 w-5" />
                      Create First Model
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {models.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>
                <Card className="hover:shadow-lg transition-all h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate">
                          {model.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          model.status === "active" ? "default" : "secondary"
                        }>
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">
                            ROC-AUC
                          </div>
                          <div className="text-sm font-bold text-primary">
                            {model.metrics.roc_auc.toFixed(3)}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">
                            PRC-AUC
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            {model.metrics.prc_auc.toFixed(3)}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">
                            Accuracy
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {(model.metrics.accuracy * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground">
                            F1 Planet
                          </div>
                          <div className="text-sm font-bold text-purple-600">
                            {model.metrics.f1_planet.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() =>
                          navigate(`/fine-tuning/classify/${model.id}`, {
                            state: { modelData: model },
                          })
                        }>
                        <Eye className="h-4 w-4" />
                        Use Model
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FineTuningList;
