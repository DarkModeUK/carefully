import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ScenariosPage = lazy(() => import("@/pages/scenario"));
const ScenarioDetailPage = lazy(() => import("@/pages/scenario-detail"));
const SimulationPage = lazy(() => import("@/pages/simulation"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const ProgressPage = lazy(() => import("@/pages/progress"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for lazy routes
function PageLoader() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/scenarios" component={ScenariosPage} />
            <Route path="/scenarios/:id" component={ScenarioDetailPage} />
            <Route path="/simulation/:scenarioId" component={SimulationPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/progress" component={ProgressPage} />
            <Route path="/settings" component={SettingsPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
