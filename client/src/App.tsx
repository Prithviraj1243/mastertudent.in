import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from "@/hooks/useAuth";
import { useRealTimeActivity } from "@/hooks/useRealTimeActivity";
import { ActivityNotifications } from "@/components/activity-notifications";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import MasterLanding from "@/pages/master-landing";
import PurposeSelection from "@/pages/purpose-selection";
import CreateAccount from "@/pages/create-account";
import DownloadNotes from "@/pages/download-notes";
import UploadNotes from "@/pages/upload-notes";
import Subscribe from "@/pages/subscribe";
import Catalog from "@/pages/catalog";
import CategorySelection from "@/pages/category-selection";
import ExamSelection from "@/pages/exam-selection";
import Upload from "@/pages/upload";
import ReviewQueue from "@/pages/review-queue";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import RealAdminDashboard from "@/pages/real-admin-dashboard";
import EnhancedAdminDashboard from "@/pages/enhanced-admin-dashboard";
import NoteDetail from "@/pages/note-detail";
import Analytics from "@/pages/analytics";
import Forum from "@/pages/forum";
import Leaderboard from "@/pages/leaderboard";
import CoinDashboard from "@/pages/coin-dashboard";
import UploaderProfile from "@/pages/uploader-profile";
import Profile from "@/pages/profile";
import ProfileUpdate from "@/pages/profile-update";
import ProfileEdit from "@/pages/profile-edit";
import PaymentSuccess from "@/pages/payment-success";
import MyActivity from "@/pages/my-activity";
import BrowseNotes from "@/pages/browse";
import TrendingNotes from "@/pages/trending";
import CategoriesPage from "@/pages/categories";
import RecentNotes from "@/pages/recent";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Initialize real-time activity monitoring
  useRealTimeActivity();

  // Check for direct authentication bypass
  const isDirectAuth = typeof window !== 'undefined' && sessionStorage.getItem('directAuth') === 'true';
  
  // Check for admin authentication bypass
  const isAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true';

  if (isLoading && !isDirectAuth && !isAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If directly authenticated, admin authenticated, or normal authentication, show main app
  if (isAuthenticated || isDirectAuth || isAdminAuth) {
    return (
      <>
        <Switch>
          <Route path="/" component={MasterLanding} />
          <Route path="/home" component={Home} />
          <Route path="/purpose-selection" component={PurposeSelection} />
          <Route path="/create-account" component={CreateAccount} />
          <Route path="/download-notes" component={DownloadNotes} />
          <Route path="/upload-notes" component={UploadNotes} />
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
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-dashboard" component={RealAdminDashboard} />
          <Route path="/admin/enhanced" component={EnhancedAdminDashboard} />
          <Route path="/notes/:id" component={NoteDetail} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/uploader-profile" component={UploaderProfile} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile-update" component={ProfileUpdate} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/my-activity" component={MyActivity} />
          <Route path="/browse" component={BrowseNotes} />
          <Route path="/trending" component={TrendingNotes} />
          <Route path="/categories" component={CategoriesPage} />
          <Route path="/recent" component={RecentNotes} />
          <Route component={NotFound} />
        </Switch>
        <ActivityNotifications />
      </>
    );
  }

  // Show landing/signup flow
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/create-account" component={CreateAccount} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
