import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import ScenariosPage from "@/pages/scenario";
import ScenarioDetailPage from "@/pages/scenario-detail";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/scenarios" component={ScenariosPage} />
      <Route path="/scenarios/:id" component={ScenarioDetailPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/progress" component={() => <div className="p-6">Progress page coming soon...</div>} />
      <Route path="/settings" component={() => <div className="p-6">Settings page coming soon...</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-neutral-50">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
