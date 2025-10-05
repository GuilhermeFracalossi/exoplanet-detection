import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

// GitHub filled icon component
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

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
    { href: "/", label: "Home" },
    { href: "/classificacao", label: "Classification" },
    { href: "/fine-tuning", label: "Fine Tuning" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={handleLinkClick}>
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
              }`}>
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <a
            href="https://github.com/GuilhermeFracalossi/exoplanet-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="GitHub Repository">
            <GitHubIcon className="h-5 w-5" />
          </a>
          <Button variant="default" size="sm" asChild>
            <Link to="/classificacao">Get Started</Link>
          </Button>
        </div>

        {/* Botão Hambúrguer e Theme Toggle para Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <a
            href="https://github.com/GuilhermeFracalossi/exoplanet-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="GitHub Repository">
            <GitHubIcon className="h-5 w-5" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
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
                }`}>
                {link.label}
              </Link>
            ))}
            <Button variant="default" size="sm" asChild className="w-full mt-2">
              <Link to="/classificacao" onClick={handleLinkClick}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
