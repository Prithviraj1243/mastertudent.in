import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Subscribe from "@/pages/subscribe";
import Catalog from "@/pages/catalog";
import Upload from "@/pages/upload";
import ReviewQueue from "@/pages/review-queue";
import AdminDashboard from "@/pages/admin-dashboard";
import NoteDetail from "@/pages/note-detail";
import Analytics from "@/pages/analytics";
import Forum from "@/pages/forum";
import Leaderboard from "@/pages/leaderboard";
import CoinDashboard from "@/pages/coin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
