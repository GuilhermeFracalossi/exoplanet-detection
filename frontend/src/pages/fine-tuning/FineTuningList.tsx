import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sparkles,
  Calendar,
  TrendingUp,
  FileText,
  Trash2,
  Eye,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
      // TODO: Replace with actual API call
      // const response = await fetch("http://localhost:8000/api/v1/fine-tuning/models", {
      //   headers: {
      //     'Authorization': `Bearer ${token}` // Add authentication
      //   }
      // });
      // const data = await response.json();
      // setModels(data.models);

      // Mock data for now
      setTimeout(() => {
        setModels([
          {
            id: "model-001",
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
          },
          {
            id: "model-002",
            name: "TESS High Precision",
            description: "Optimized for TESS mission candidates",
            created_at: "2025-09-28T14:20:00Z",
            metrics: {
              roc_auc: 0.9756,
              prc_auc: 0.9521,
              accuracy: 0.918,
              f1_planet: 0.8823,
            },
            hyperparameters: {
              n_estimators: 1200,
              learning_rate: 0.005,
              max_depth: 8,
              num_leaves: 256,
            },
            training_samples: 8934,
            status: "active",
          },
          {
            id: "model-003",
            name: "Multi-Mission Hybrid",
            description: "Combined training from Kepler, K2 and TESS",
            created_at: "2025-09-25T09:15:00Z",
            metrics: {
              roc_auc: 0.9689,
              prc_auc: 0.9412,
              accuracy: 0.9012,
              f1_planet: 0.8745,
            },
            hyperparameters: {
              n_estimators: 1000,
              learning_rate: 0.008,
              max_depth: 12,
              num_leaves: 200,
            },
            training_samples: 22150,
            status: "active",
          },
        ]);
        setLoading(false);
      }, 800);
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

  const handleDeleteModel = async (modelId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`http://localhost:8000/api/v1/fine-tuning/models/${modelId}`, {
      //   method: "DELETE",
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      setModels(models.filter((m) => m.id !== modelId));
      toast({
        title: "Model deleted",
        description: "Your custom model was successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting model:", error);
      toast({
        title: "Error",
        description: "Could not delete the model.",
        variant: "destructive",
      });
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
      <main className="container pt-24 pb-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                Fine Tuning
              </h1>
              <p className="text-xl text-muted-foreground">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <CardDescription className="text-sm line-clamp-2">
                          {model.description}
                        </CardDescription>
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

                      {/* Info */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{formatDate(model.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {model.training_samples.toLocaleString()} samples
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {model.hyperparameters.n_estimators} trees, LR:{" "}
                            {model.hyperparameters.learning_rate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() =>
                          navigate(`/fine-tuning/classify/${model.id}`)
                        }>
                        <Eye className="h-4 w-4" />
                        Use Model
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Model?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the model "{model.name}" and
                              all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteModel(model.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
