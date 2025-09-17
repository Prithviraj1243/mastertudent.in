import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Subscribe from "@/pages/subscribe";
import Catalog from "@/pages/catalog";
import CategorySelection from "@/pages/category-selection";
import ExamSelection from "@/pages/exam-selection";
import Upload from "@/pages/upload";
import ReviewQueue from "@/pages/review-queue";
import AdminDashboard from "@/pages/admin-dashboard";
import NoteDetail from "@/pages/note-detail";
import Analytics from "@/pages/analytics";
import Forum from "@/pages/forum";
import Leaderboard from "@/pages/leaderboard";
import CoinDashboard from "@/pages/coin-dashboard";
import UploaderProfile from "@/pages/uploader-profile";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Check if user needs onboarding
  if (user && user.onboardingCompleted === false) {
    return (
      <Switch>
        <Route component={Onboarding} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={CategorySelection} />
      <Route path="/exam-selection" component={ExamSelection} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/forum" component={Forum} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/coin-dashboard" component={CoinDashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/review-queue" component={ReviewQueue} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/notes/:id" component={NoteDetail} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/uploader-profile" component={UploaderProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
