import { Check, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

export const Planos = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para começar a explorar a detecção de exoplanetas",
      features: [
        "10 classificações por mês",
        "Acesso a modelos básicos",
        "Resultados em até 24h",
        "Suporte por email",
        "Documentação completa",
      ],
      buttonText: "Começar Grátis",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Premium",
      price: "R$ 49,90",
      period: "/mês",
      description: "Para pesquisadores e entusiastas sérios",
      features: [
        "Classificações ilimitadas",
        "Acesso a todos os modelos",
        "Resultados em tempo real",
        "Fine-tuning personalizado",
        "Suporte prioritário 24/7",
        "API de integração",
        "Exportação de dados avançada",
        "Análise de múltiplos datasets",
      ],
      buttonText: "Assinar Premium",
      buttonVariant: "default" as const,
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container px-4 pt-32 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Escolha seu Plano
          </h1>
          <p className="text-base text-muted-foreground">
            Selecione o plano ideal para suas necessidades de detecção de exoplanetas
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                <CardDescription className="text-xs">
                  {plan.description}
                </CardDescription>
                <div className="mt-3">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="default"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground">
            Todos os planos incluem acesso à plataforma Specttra e atualizações
            regulares. Cancele quando quiser, sem taxas adicionais.
          </p>
        </div>
      </section>
    </div>
  );
};
