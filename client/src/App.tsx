import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CalculatorPage from "@/pages/Calculator";
import ComparativePage from "@/pages/Comparative";
import BudgetPage from "@/pages/Budget";
import TechnicalPage from "@/pages/Technical";
import AboutPage from "@/pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalculatorPage} />
      <Route path="/comparative" component={ComparativePage} />
      <Route path="/budget" component={BudgetPage} />
      <Route path="/technical" component={TechnicalPage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
