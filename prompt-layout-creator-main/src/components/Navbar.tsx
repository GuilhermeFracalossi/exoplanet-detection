import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ExoSight
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Início
          </Link>
          <Link 
            to="/classificacao" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/classificacao") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Classificação
          </Link>
          <Link 
            to="/fine-tuning" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/fine-tuning") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Fine Tuning
          </Link>
          
          <Button variant="default" size="sm" asChild>
            <Link to="/classificacao">Começar</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};
