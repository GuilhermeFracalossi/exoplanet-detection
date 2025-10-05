import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Classificacao from "./pages/Classificacao";
import FineTuning from "./pages/FineTuning";
import CreateModel from "./pages/fine-tuning/CreateModel";
import CustomModelClassify from "./pages/fine-tuning/CustomModelClassify";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/classificacao" element={<Classificacao />} />
        <Route path="/fine-tuning" element={<FineTuning />} />
        <Route path="/fine-tuning/create" element={<CreateModel />} />
        <Route
          path="/fine-tuning/classify/:modelId"
          element={<CustomModelClassify />}
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
