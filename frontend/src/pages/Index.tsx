import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MetricCard } from "@/components/MetricCard";
import heroImage from "@/assets/hero-planet.jpg";
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
  ComposedChart,
} from "recharts";

const missionData = [
  {
    mission: "Kepler (KOI)",
    descobertas: 2335,
    accuracy: 0.93,
    f1: 0.9,
    rocAuc: 0.97,
    prAuc: 0.92,
  },
  {
    mission: "K2",
    descobertas: 479,
    accuracy: 0.91,
    f1: 0.88,
    rocAuc: 0.95,
    prAuc: 0.9,
  },
  {
    mission: "TESS",
    descobertas: 387,
    accuracy: 0.92,
    f1: 0.89,
    rocAuc: 0.96,
    prAuc: 0.91,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <StarField />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Detecte Exoplanetas com{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Inteligência Artificial
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Algoritmo proprietário treinado em dados de missões Kepler, K2 e
                TESS. Classifique candidatos a exoplanetas com precisão de até
                97% ROC-AUC.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="group">
                  <Link to="/classificacao">
                    Classificar CSV Agora
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#metricas">Ver Métricas</a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative animate-float">
                <img
                  src={heroImage}
                  alt="Exoplaneta orbitando estrela distante"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-2xl" />
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Performance do Modelo Specttra
            </h2>
            <p className="text-xl text-muted-foreground">
              Métricas validadas em dados reais de missões espaciais
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <MetricCard
              title="Total de Exoplanetas"
              value="3,201"
              description="Confirmados nas missões"
              icon={<Database className="h-4 w-4" />}
              delay={0}
            />
            <MetricCard
              title="Precisão Média"
              value="92.0%"
              description="Accuracy across missions"
              icon={<TrendingUp className="h-4 w-4" />}
              delay={0.1}
            />
            <MetricCard
              title="ROC-AUC Médio"
              value="0.96"
              description="Excelente discriminação"
              icon={<Cpu className="h-4 w-4" />}
              delay={0.2}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6">
              Descobertas e Performance por Missão
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={missionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="mission" />
                <YAxis yAxisId="left" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0.85, 1.0]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="descobertas"
                  name="Descobertas"
                  fill="hsl(var(--chart-1))"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rocAuc"
                  name="ROC-AUC"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {missionData.map((mission, idx) => (
              <motion.div
                key={mission.mission}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg"
              >
                <h4 className="text-lg font-bold mb-4">{mission.mission}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-semibold">
                      {(mission.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">F1-Score:</span>
                    <span className="font-semibold">
                      {mission.f1.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROC-AUC:</span>
                    <span className="font-semibold">
                      {mission.rocAuc.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PR-AUC:</span>
                    <span className="font-semibold">
                      {mission.prAuc.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Como Funciona?</h2>
            <p className="text-xl text-muted-foreground">
              Três passos simples para classificar seus dados
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Carregue seu CSV",
                description:
                  "Faça upload de dados com features de trânsito como período orbital, duração, profundidade e SNR.",
              },
              {
                step: "2",
                title: "Classifique",
                description:
                  "Nosso modelo proprietário analisa cada candidato e retorna probabilidades para cada classe.",
              },
              {
                step: "3",
                title: "Fine Tuning (Premium)",
                description:
                  "Ajuste o modelo com seus próprios dados rotulados para melhorar ainda mais a precisão.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-card rounded-2xl p-8 shadow-lg"
              >
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
            className="text-center mt-12"
          >
            <Button size="lg" asChild>
              <Link to="/classificacao">
                Começar Agora
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
            © 2025 Specttra. Classificação de exoplanetas com Machine Learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
