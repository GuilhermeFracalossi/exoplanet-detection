import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react"; // Importe os ícones Menu e X
import { Button } from "./ui/button";

export const Navbar = () => {
  const location = useLocation();
  // Estado para controlar a visibilidade do menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Função para fechar o menu ao clicar em um link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/classificacao", label: "Classificação" },
    { href: "/fine-tuning", label: "Fine Tuning" },
    { href: "/planos", label: "Planos" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={handleLinkClick}>
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Specttra
          </span>
        </Link>

        {/* Links de Navegação para Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="default" size="sm" asChild>
            <Link to="/classificacao">Começar</Link>
          </Button>
        </div>

        {/* Botão Hambúrguer para Mobile */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border/40">
          <div className="container flex flex-col items-start gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleLinkClick} // Fecha o menu ao clicar
                className={`w-full text-lg font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="default" size="sm" asChild className="w-full mt-2">
              <Link to="/classificacao" onClick={handleLinkClick}>Começar</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};