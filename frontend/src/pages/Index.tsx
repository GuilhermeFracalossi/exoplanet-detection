import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { MetricCard } from "@/components/MetricCard";
import { useEffect, useRef } from "react";
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

const HeroStarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    updateSize();

    // Estrelas de fundo com efeito parallax
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
      twinklePhase: number;
      twinkleSpeed: number;
      fallSpeed: number;
    }> = [];

    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random(),
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        fallSpeed: Math.random() * 0.3 + 0.1,
      });
    }

    // Sistema planetário
    const planets = [
      {
        name: "Exoplanet",
        distance: 100,
        size: 22,
        speed: 0.012,
        angle: 0,
        color: { r: 65, g: 105, b: 225 },
        tilt: 0.35,
      },
    ];

    let animationFrameId: number;
    let time = 0;

    const easeInOutQuad = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const drawStar = (x: number, y: number, radius: number, glow: number) => {
      // Glow externo
      const gradient1 = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
      gradient1.addColorStop(0, `rgba(255, 230, 100, ${0.15 * glow})`);
      gradient1.addColorStop(0.2, `rgba(255, 200, 80, ${0.1 * glow})`);
      gradient1.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = gradient1;
      ctx.beginPath();
      ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow médio
      const gradient2 = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient2.addColorStop(0, `rgba(255, 240, 200, ${0.6 * glow})`);
      gradient2.addColorStop(0.4, `rgba(255, 210, 100, ${0.4 * glow})`);
      gradient2.addColorStop(1, "rgba(255, 180, 60, 0)");
      ctx.fillStyle = gradient2;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core da estrela
      const gradient3 = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        0,
        x,
        y,
        radius
      );
      gradient3.addColorStop(0, "#FFFEF5");
      gradient3.addColorStop(0.2, "#FFF9E0");
      gradient3.addColorStop(0.5, "#FFE55C");
      gradient3.addColorStop(0.8, "#FFB84D");
      gradient3.addColorStop(1, "#FF9933");
      ctx.fillStyle = gradient3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      const highlight = ctx.createRadialGradient(
        x - radius * 0.4,
        y - radius * 0.4,
        0,
        x - radius * 0.2,
        y - radius * 0.2,
        radius * 0.6
      );
      highlight.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      highlight.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
      highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlanet = (
      x: number,
      y: number,
      z: number,
      size: number,
      color: { r: number; g: number; b: number }
    ) => {
      const scale = 0.3 + z * 0.7; // Perspectiva 3D
      const actualSize = size * scale;
      const brightness = 0.4 + z * 0.6;

      // Glow do planeta
      const glow = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 3);
      glow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.4 * brightness})`);
      glow.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.2 * brightness})`);
      glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, actualSize * 3, 0, Math.PI * 2);
      ctx.fill();

      // Corpo do planeta com iluminação
      const planetGradient = ctx.createRadialGradient(
        x - actualSize * 0.5,
        y - actualSize * 0.5,
        0,
        x,
        y,
        actualSize
      );

      const lightR = Math.min(255, color.r + 80);
      const lightG = Math.min(255, color.g + 80);
      const lightB = Math.min(255, color.b + 80);

      const darkR = Math.max(0, color.r - 60);
      const darkG = Math.max(0, color.g - 60);
      const darkB = Math.max(0, color.b - 60);

      planetGradient.addColorStop(0, `rgba(${lightR}, ${lightG}, ${lightB}, ${brightness})`);
      planetGradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness})`);
      planetGradient.addColorStop(1, `rgba(${darkR}, ${darkG}, ${darkB}, ${brightness * 0.8})`);

      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(x, y, actualSize, 0, Math.PI * 2);
      ctx.fill();

      // Highlight sutil
      const highlight = ctx.createRadialGradient(
        x - actualSize * 0.4,
        y - actualSize * 0.4,
        0,
        x - actualSize * 0.2,
        y - actualSize * 0.2,
        actualSize * 0.5
      );
      highlight.addColorStop(0, `rgba(255, 255, 255, ${0.6 * brightness})`);
      highlight.addColorStop(0.5, `rgba(255, 255, 255, ${0.2 * brightness})`);
      highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x - actualSize * 0.3, y - actualSize * 0.3, actualSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Desenhar estrelas de fundo com efeito de cintilação
      ctx.save();
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6;
        
        // Movimento de queda
        star.y += star.fallSpeed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (0.5 + star.z * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * (0.3 + star.z * 0.7)})`;
        ctx.fill();

        // Pequenos raios nas estrelas maiores
        if (star.size > 1.5 && twinkle > 0.8) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Atualizar e ordenar planetas por profundidade (z)
      planets.forEach((planet) => {
        planet.angle += planet.speed;
      });

      const planetsWithZ = planets.map((planet) => {
        const x = centerX + Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.tilt;
        const y = centerY + z * planet.distance;
        return { ...planet, x, y, z: 0.5 + z };
      });

      // Ordenar por Z (desenhar primeiro os que estão atrás)
      planetsWithZ.sort((a, b) => a.z - b.z);

      // Desenhar planetas que estão atrás da estrela
      planetsWithZ.forEach((planet) => {
        if (planet.z < 0.5) {
          drawPlanet(planet.x, planet.y, planet.z, planet.size, planet.color);
        }
      });

      // Desenhar a estrela central com pulsação suave
      const starGlow = 1 + Math.sin(time * 0.5) * 0.08;
      drawStar(centerX, centerY, 45, starGlow);

      // Desenhar planetas que estão na frente da estrela
      planetsWithZ.forEach((planet) => {
        if (planet.z >= 0.5) {
          drawPlanet(planet.x, planet.y, planet.z, planet.size, planet.color);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateSize();
      // Reposicionar estrelas
      stars.forEach((star) => {
        if (star.x > canvas.width) star.x = Math.random() * canvas.width;
        if (star.y > canvas.height) star.y = Math.random() * canvas.height;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

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

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-2xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 bg-black/90">
                  <HeroStarField />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
            </div>
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
