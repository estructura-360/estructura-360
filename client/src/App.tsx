import Login from "@/pages/Login";import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner } from "@/components/OfflineBanner";
import NotFound from "@/pages/not-found";
import CalculatorPage from "@/pages/Calculator";
import ComparativePage from "@/pages/Comparative";
import BudgetPage from "@/pages/Budget";
import TechnicalPage from "@/pages/Technical";
import AboutPage from "@/pages/About";
import MarketplacePage from "@/pages/Marketplace";
import SchedulePage from "@/pages/Schedule";
import LogbookPage from "@/pages/Logbook";
import CatalogPage from "@/pages/Catalog";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={CalculatorPage} />
      <Route path="/comparative" component={ComparativePage} />
      <Route path="/budget" component={BudgetPage} />
      <Route path="/technical" component={TechnicalPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/logbook" component={LogbookPage} />
      <Route path="/catalog" component={CatalogPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUserEmail(data.user?.email ?? null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setUserEmail(session?.user?.email ?? null);
  });
}, []);

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <OfflineBanner />
      </TooltipProvider>
      {userEmail && (
  <div className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 text-sm">
    <div>{userEmail}</div>

    <button onClick={handleLogout} className="text-red-600">
      Cerrar sesión
    </button>
  </div>
)}
    </QueryClientProvider>
  );
}

export default App;
