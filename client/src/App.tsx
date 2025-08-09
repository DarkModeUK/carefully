import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import ScenariosPage from "@/pages/scenario";
import ScenarioDetailPage from "@/pages/scenario-detail";
import ProfilePage from "@/pages/profile";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/scenarios" component={ScenariosPage} />
          <Route path="/scenarios/:id" component={ScenarioDetailPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/progress" component={() => <div className="p-6">Progress page coming soon...</div>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      {isAuthenticated && !isLoading && <Navigation />}
      <Router />
    </div>
  );
}

export default App;
