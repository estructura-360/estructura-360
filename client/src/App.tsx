import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Login from "@/pages/Login";

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

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return null;

  if (!userEmail) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <OfflineBanner />

        <div className="fixed top-0 right-0 m-3 bg-white shadow rounded px-3 py-1 text-sm flex gap-3 items-center">
          <span>{userEmail}</span>

          <button onClick={handleLogout} className="text-red-600">
            Cerrar sesión
          </button>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}