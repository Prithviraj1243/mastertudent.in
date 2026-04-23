import { Switch, Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// GoogleOAuthProvider no longer needed - using Supabase Auth
import { useAuth } from "@/hooks/useAuth";
import { makeMatcher } from "wouter/matcher";
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
import DownloadNotesEnhanced from "@/pages/download-notes-enhanced";
import DownloadAnalytics from "@/pages/download-analytics";
import Subscribe from "@/pages/subscribe";
import Catalog from "@/pages/catalog";
import CategorySelection from "@/pages/category-selection";
import ExamSelection from "@/pages/exam-selection";
import Upload from "@/pages/upload";
import ReviewQueue from "@/pages/review-queue";
import BecomeTopper from "@/pages/become-topper";
import NoteDetail from "@/pages/note-detail";
import Analytics from "@/pages/analytics";
import Forum from "@/pages/forum";
import Leaderboard from "@/pages/leaderboard";
import CoinDashboard from "@/pages/coin-dashboard";
import EarningsPage from "@/pages/earnings";
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
import OldAdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminNotes from "@/pages/admin-notes";
import AdminAnalytics from "@/pages/admin-analytics";
import AuthCallback from "@/pages/auth-callback";
import AdminLogin from "@/pages/admin-login";
import StartJourney from "@/pages/start-journey";
import BecomeAdmin from "@/pages/become-admin";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminNotesManagement from "@/pages/admin/notes-management-enhanced";
import AdminUsersManagement from "@/pages/admin/users-management";
import AdminCoinManagement from "@/pages/admin/coin-management";

// Custom hook for browser-based routing (no hash)
import { useBrowserLocation } from "wouter/use-browser-location";

function AppRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Initialize real-time activity monitoring
  useRealTimeActivity();

  // Always allow the OAuth callback route to render.
  // Otherwise the app can get stuck on loading/landing before the callback code
  // has a chance to read the Supabase session and redirect.
  if (location.startsWith("/auth/callback")) {
    return <AuthCallback />;
  }

  // Check for direct authentication bypass
  const isDirectAuth = typeof window !== 'undefined' && sessionStorage.getItem('directAuth') === 'true';
  
  // Check for admin authentication (independent from user auth)
  const isAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true';
  
  if (isLoading && !isDirectAuth && !isAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If admin is authenticated, show admin routes (independent from main site login)
  if (isAdminAuth) {
    return (
      <>
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/notes" component={AdminNotesManagement} />
          <Route path="/admin/users" component={AdminUsersManagement} />
          <Route path="/admin/coins" component={AdminCoinManagement} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route component={AdminDashboard} />
        </Switch>
      </>
    );
  }

  // If directly authenticated or normal authentication, show main app
  if (isAuthenticated || isDirectAuth) {
    return (
      <>
        <Switch>
          <Route path="/" component={MasterLanding} />
          <Route path="/home" component={Home} />
          <Route path="/purpose-selection" component={PurposeSelection} />
          <Route path="/create-account" component={CreateAccount} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route path="/start-journey" component={StartJourney} />
          <Route path="/become-admin" component={BecomeAdmin} />
          
          {/* Admin login - accessible even when main site is authenticated */}
          <Route path="/admin/login" component={AdminLogin} />
          
          <Route path="/download-notes" component={DownloadNotesEnhanced} />
          <Route path="/download-analytics" component={DownloadAnalytics} />
          <Route path="/upload-notes" component={Upload} />
          <Route path="/categories" component={CategorySelection} />
          <Route path="/exam-selection" component={ExamSelection} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/forum" component={Forum} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/coin-dashboard" component={CoinDashboard} />
          <Route path="/earnings" component={EarningsPage} />
          <Route path="/upload" component={Upload} />
          <Route path="/review-queue" component={ReviewQueue} />
          <Route path="/become-topper" component={BecomeTopper} />
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
          {/* Old Admin Routes - kept for compatibility */}
          <Route path="/admin-dashboard-old" component={OldAdminDashboard} />
          <Route path="/admin/users-old" component={AdminUsers} />
          <Route path="/admin/notes-old" component={AdminNotes} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route component={NotFound} />
        </Switch>
        <ActivityNotifications />
      </>
    );
  }

  // Show landing/signup flow + admin login (no auth required)
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/create-account" component={CreateAccount} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useBrowserLocation}>
          <Toaster />
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
