import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MetricCard } from "@/components/MetricCard";
import heroImage from "@/assets/hero-planet.jpg";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  LabelList,
} from "recharts";

const Index = () => {
  const [realMetrics, setRealMetrics] = useState<any>(null);
  const [satelliteMetrics, setSatelliteMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar métricas reais da API
    fetch("http://localhost/api/v1/metrics")
      .then((res) => res.json())
      .then((data) => {
        // Usar métricas globais de teste
        setRealMetrics(data.metricas_globais_teste);
        // Usar métricas por satélite
        setSatelliteMetrics(data.metricas_por_satelite_teste);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar métricas:", err);
        setLoading(false);
      });
  }, []);

  // Preparar dados para o gráfico de radar (métricas globais)
  const getRadarData = () => {
    if (!realMetrics) return [];
    return [
      {
        metric: "Accuracy",
        value: realMetrics.acuracia * 100,
        fullMark: 100,
      },
      {
        metric: "Precision",
        value: realMetrics.precisao_planeta * 100,
        fullMark: 100,
      },
      {
        metric: "Recall",
        value: realMetrics.recall_planeta * 100,
        fullMark: 100,
      },
      {
        metric: "F1-Score",
        value: realMetrics.f1_score_planeta * 100,
        fullMark: 100,
      },
      {
        metric: "AUC-ROC",
        value: realMetrics.auc_roc * 100,
        fullMark: 100,
      },
      {
        metric: "AUC-PRC",
        value: realMetrics.auc_prc * 100,
        fullMark: 100,
      },
    ];
  };

  // Preparar dados para comparação por satélite
  const getSatelliteComparisonData = () => {
    if (!satelliteMetrics) return [];
    return Object.entries(satelliteMetrics).map(
      ([satellite, metrics]: [string, any]) => ({
        satellite,
        Accuracy: metrics.acuracia * 100,
        "F1-Score": metrics.f1_score_planeta * 100,
        Recall: metrics.recall_planeta * 100,
        Precision: metrics.precisao_planeta * 100,
      })
    );
  };

  // Custom Tooltip para o gráfico de barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-4 rounded-lg border border-border shadow-lg">
          <p className="font-bold mb-3 text-base">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
                <span className="font-semibold text-sm">
                  {Number(entry.value).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <StarField />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Detect Exoplanets with{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Specttra
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                Proprietary algorithm trained on Kepler, K2 and TESS mission
                data. Classify exoplanet candidates with up to{" "}
                {loading
                  ? "..."
                  : `${(realMetrics?.auc_roc * 100).toFixed(1)}%`}{" "}
                ROC-AUC accuracy.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button size="lg" asChild className="group">
                  <Link to="/classificacao">
                    Classify CSV Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#metricas">View Metrics</a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative">
              <div className="relative animate-float">
                <img
                  src={heroImage}
                  alt="Exoplanet orbiting distant star"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metricas" className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Specttra Model Performance
            </h2>
            <p className="text-xl text-muted-foreground">
              Metrics validated on real space mission data
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <MetricCard
              title={loading ? "Loading..." : "F1-Score Planet"}
              value={
                loading
                  ? "..."
                  : `${(realMetrics?.f1_score_planeta * 100).toFixed(1)}%`
              }
              description="Balanced precision and recall"
              icon={<TrendingUp className="h-4 w-4" />}
              delay={0}
            />
            <MetricCard
              title={loading ? "Loading..." : "ROC-AUC Score"}
              value={
                loading ? "..." : `${(realMetrics?.auc_roc * 100).toFixed(1)}%`
              }
              description="Excellent discrimination"
              icon={<Cpu className="h-4 w-4" />}
              delay={0.1}
            />
            <MetricCard
              title={loading ? "Loading..." : "Planet Precision"}
              value={
                loading
                  ? "..."
                  : `${(realMetrics?.precisao_planeta * 100).toFixed(1)}%`
              }
              description="Positive predictive value"
              icon={<Database className="h-4 w-4" />}
              delay={0.2}
            />
          </div>

          {/* Model Performance Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Radar Chart - Metrics Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">
                Overall Model Performance
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                All key metrics in a single view
              </p>
              {loading ? (
                <div className="h-[380px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading metrics...
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 14 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <Radar
                      name="Specttra Model"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Bar Chart - Comparação por Satélite */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">
                Performance by Mission
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Accuracy and F1-Score across different space missions
              </p>
              {loading ? (
                <div className="h-[380px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading metrics...
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={getSatelliteComparisonData()}
                    barGap={6}
                    barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="satellite"
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 14 }}
                    />
                    <YAxis
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{
                        color: "hsl(var(--foreground))",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                      itemStyle={{
                        color: "hsl(var(--muted-foreground))",
                        fontSize: 13,
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)}%`,
                        name,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="Accuracy"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                      animationDuration={500}
                      onMouseOver={(e) =>
                        (e.target.style.filter = "brightness(1.2)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.filter = "brightness(1)")
                      }
                    />
                    <Bar
                      dataKey="F1-Score"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      animationDuration={500}
                      onMouseOver={(e) =>
                        (e.target.style.filter = "brightness(1.2)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.filter = "brightness(1)")
                      }
                    />
                    <Bar
                      dataKey="Recall"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      animationDuration={500}
                      onMouseOver={(e) =>
                        (e.target.style.filter = "brightness(1.2)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.filter = "brightness(1)")
                      }
                    />
                    <Bar
                      dataKey="Precision"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                      animationDuration={500}
                      onMouseOver={(e) =>
                        (e.target.style.filter = "brightness(1.2)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.filter = "brightness(1)")
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {loading
              ? // Loading placeholder
                [1, 2, 3].map((idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-lg">
                    <h4 className="text-lg font-bold mb-4">Loading...</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-semibold">...</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              : satelliteMetrics
              ? // Real satellite metrics
                Object.entries(satelliteMetrics).map(
                  ([satellite, metrics]: [string, any], idx) => (
                    <motion.div
                      key={satellite}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-card rounded-2xl p-6 shadow-lg">
                      <h4 className="text-lg font-bold mb-4">{satellite}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Accuracy:
                          </span>
                          <span className="font-semibold">
                            {(metrics.acuracia * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            F1-Score:
                          </span>
                          <span className="font-semibold">
                            {(metrics.f1_score_planeta * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recall:</span>
                          <span className="font-semibold">
                            {(metrics.recall_planeta * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Precision:
                          </span>
                          <span className="font-semibold">
                            {(metrics.precisao_planeta * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            ROC-AUC:
                          </span>
                          <span className="font-semibold">
                            {metrics.auc_roc.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                )
              : null}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works?</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to classify your data
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your CSV",
                description:
                  "Upload data with transit features like orbital period, duration, depth and SNR.",
              },
              {
                step: "2",
                title: "Classify",
                description:
                  "Our proprietary model analyzes each candidate and returns probabilities for each class.",
              },
              {
                step: "3",
                title: "Fine Tuning (Premium)",
                description:
                  "Tune the model with your own labeled data to further improve accuracy.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-card rounded-2xl p-8 shadow-lg">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mt-6 mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/classificacao">
                Start Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © 2025 Specttra. Exoplanet classification with Machine Learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
