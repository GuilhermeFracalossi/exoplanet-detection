import { useState } from "react";
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
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast({
        title: "Arquivo carregado",
        description: `${e.target.files[0].name} está pronto para validação.`,
      });
    }
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

    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simular resultados linha por linha do CSV
    const mockRows = [
      {
        id: "KOI-001",
        orbital_period: 3.52,
        transit_duration: 2.1,
        planet_radius: 1.8,
        class: "CONFIRMED",
        confidence: 0.94,
      },
      {
        id: "KOI-002",
        orbital_period: 10.23,
        transit_duration: 3.5,
        planet_radius: 2.3,
        class: "PC",
        confidence: 0.78,
      },
      {
        id: "KOI-003",
        orbital_period: 1.89,
        transit_duration: 1.2,
        planet_radius: 0.9,
        class: "FP",
        confidence: 0.67,
      },
      {
        id: "KOI-004",
        orbital_period: 15.67,
        transit_duration: 4.1,
        planet_radius: 3.1,
        class: "CONFIRMED",
        confidence: 0.91,
      },
      {
        id: "KOI-005",
        orbital_period: 7.34,
        transit_duration: 2.8,
        planet_radius: 1.5,
        class: "PC",
        confidence: 0.82,
      },
      {
        id: "KOI-006",
        orbital_period: 2.45,
        transit_duration: 1.6,
        planet_radius: 1.2,
        class: "FP",
        confidence: 0.55,
      },
      {
        id: "KOI-007",
        orbital_period: 22.18,
        transit_duration: 5.3,
        planet_radius: 4.2,
        class: "CONFIRMED",
        confidence: 0.88,
      },
      {
        id: "KOI-008",
        orbital_period: 5.91,
        transit_duration: 2.3,
        planet_radius: 1.9,
        class: "APC",
        confidence: 0.71,
      },
    ];

    setResults({
      rows: mockRows,
      summary: {
        CONFIRMED: mockRows.filter((r) => r.class === "CONFIRMED").length,
        PC: mockRows.filter((r) => r.class === "PC").length,
        FP: mockRows.filter((r) => r.class === "FP").length,
        APC: mockRows.filter((r) => r.class === "APC").length,
        KP: 0,
      },
      total: mockRows.length,
    });

    setIsProcessing(false);
    toast({
      title: "Classificação completa!",
      description: `${mockRows.length} objetos classificados com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Classificação de Exoplanetas
          </h1>
          <p className="text-xl text-muted-foreground">
            Faça upload do seu CSV e classifique candidatos usando nosso modelo
            Specttra
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
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
                      "orbital_period",
                      "transit_duration",
                      "planet_radius",
                      "depth_ppm",
                      "snr",
                      "impact_parameter",
                    ].map((col) => (
                      <Badge key={col} variant="secondary">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {file && (
              <Card>
                <CardHeader>
                  <CardTitle>Threshold de Decisão</CardTitle>
                  <CardDescription>
                    Ajuste a sensibilidade da classificação (threshold:{" "}
                    {threshold[0].toFixed(2)})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={threshold}
                    onValueChange={setThreshold}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Mais sensível</span>
                    <span>Mais conservador</span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                          <TableHead>Período Orbital</TableHead>
                          <TableHead>Duração Trânsito</TableHead>
                          <TableHead>Raio Planeta</TableHead>
                          <TableHead>Classe</TableHead>
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
                            <TableCell>
                              {row.orbital_period.toFixed(2)} dias
                            </TableCell>
                            <TableCell>
                              {row.transit_duration.toFixed(2)} h
                            </TableCell>
                            <TableCell>
                              {row.planet_radius.toFixed(2)} R⊕
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  row.class === "CONFIRMED"
                                    ? "default"
                                    : row.class === "PC"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {row.class}
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

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre o Modelo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  O modelo Specttra foi treinado com dados de missões Kepler, K2
                  e TESS, usando método de detecção por trânsito.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROC-AUC:</span>
                    <span className="font-semibold">0.96</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">F1-Score:</span>
                    <span className="font-semibold">0.89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classes de Saída</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <Badge className="mb-1">CONFIRMED</Badge>
                  <p className="text-muted-foreground text-xs">
                    Planeta confirmado
                  </p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">
                    PC
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    Planet Candidate
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">
                    FP
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    False Positive
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Classificacao;
