import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { WelcomeWizard } from "@/components/welcome-wizard";
import { useAuth } from "@/hooks/useAuth";
import { usePreloadData } from "@/hooks/usePreloadData";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Suspense, lazy, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ScenariosPage = lazy(() => import("@/pages/scenario"));
const ScenarioDetailPage = lazy(() => import("@/pages/scenario-detail"));
const SimulationPage = lazy(() => import("@/pages/simulation"));
const SimulationResultsPage = lazy(() => import("@/pages/simulation-results"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const ProgressPage = lazy(() => import("@/pages/progress"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/not-found"));

// New feature pages
const Forums = lazy(() => import("@/pages/forums"));
const EmotionalTracker = lazy(() => import("@/pages/emotional-tracker"));
const ManagerDashboard = lazy(() => import("@/pages/manager-dashboard"));
const RecruiterDashboard = lazy(() => import("@/pages/recruiter-dashboard"));
const CulturalSensitivity = lazy(() => import("@/pages/cultural-sensitivity"));
const BadgesAwards = lazy(() => import("@/pages/badges-awards"));
const VisualAids = lazy(() => import("@/pages/visual-aids"));
const NonVerbalCommunication = lazy(() => import("@/pages/non-verbal-communication"));
const QuickPractice = lazy(() => import("@/pages/quick-practice"));

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  
  // Scroll to top on route changes
  useScrollToTop();
  
  // Preload critical data for better performance
  usePreloadData();

  // Show welcome wizard for authenticated users who haven't completed onboarding
  const shouldShowWizard = isAuthenticated && user && !(user as any).onboardingCompleted && !showWizard;

  if (shouldShowWizard) {
    return <WelcomeWizard onComplete={() => setShowWizard(true)} />;
  }



  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {isLoading ? (
          <Route path="*" component={() => <PageLoader />} />
        ) : !isAuthenticated ? (
          <Route path="*" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/scenarios" component={ScenariosPage} />
            <Route path="/scenarios/:id" component={ScenarioDetailPage} />
            <Route path="/simulation/:scenarioId" component={SimulationPage} />
            <Route path="/simulation/:scenarioId/results" component={SimulationResultsPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/progress" component={ProgressPage} />
            <Route path="/settings" component={SettingsPage} />
            
            {/* New feature routes */}
            <Route path="/forums" component={Forums} />
            <Route path="/emotional-tracker" component={EmotionalTracker} />
            <Route path="/cultural-sensitivity" component={CulturalSensitivity} />
            <Route path="/badges-awards" component={BadgesAwards} />
            <Route path="/visual-aids" component={VisualAids} />
            <Route path="/non-verbal-communication" component={NonVerbalCommunication} />
            <Route path="/quick-practice" component={QuickPractice} />
            
            {/* Role-specific dashboards */}
            <Route path="/manager-dashboard" component={ManagerDashboard} />
            <Route path="/recruiter-dashboard" component={RecruiterDashboard} />
            
            <Route component={NotFound} />
          </>
        )}
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
