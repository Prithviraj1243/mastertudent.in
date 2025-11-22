import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Download, 
  Heart, 
  Plus, 
  FileText, 
  BarChart3, 
  ClipboardList, 
  Users, 
  Settings,
  Crown,
  User,
  LogOut,
  Activity,
  Bookmark,
  UserPlus,
  History,
  Star,
  Upload
} from "lucide-react";

interface SidebarProps {
  currentMode?: 'browse' | 'upload' | 'dashboard';
}

// Extend Window interface for Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default function Sidebar({ currentMode = 'dashboard' }: SidebarProps) {
  const { user } = useAuth();
  const { stats } = useUserStats();
  const [location] = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path: string) => location === path;

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    // Clear all session data
    sessionStorage.clear();
    localStorage.clear();
    
    // Clear any Google authentication
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Redirect to landing page
    window.location.href = '/';
  };

  const studentLinks = [
    { path: "/", icon: BookOpen, label: "🏠 Home Dashboard", active: isActive("/") && currentMode === 'dashboard' },
    { path: "/profile", icon: User, label: "👤 My Profile", active: isActive("/profile") },
  ];


  const myActivityLinks = [
    { path: "/my-uploads", icon: Upload, label: "My Uploads", active: isActive("/my-uploads"), badge: stats?.notesUploaded?.toString() || "0" },
    { path: "/following", icon: UserPlus, label: "Following", active: isActive("/following"), badge: "0" },
    { path: "/history", icon: History, label: "History", active: isActive("/history"), badge: null },
  ];

  const topperLinks = [
    { path: "/upload", icon: Plus, label: "Upload Notes", active: isActive("/upload") || currentMode === 'upload' },
    { path: "/my-notes", icon: FileText, label: "My Notes", active: isActive("/my-notes") },
    { path: "/analytics", icon: BarChart3, label: "Analytics", active: isActive("/analytics") },
  ];

  const reviewerLinks = [
    { path: "/review-queue", icon: ClipboardList, label: "Review Queue", active: isActive("/review-queue") },
  ];

  const adminLinks = [
    { path: "/admin", icon: Settings, label: "Dashboard", active: isActive("/admin") },
    { path: "/user-management", icon: Users, label: "User Management", active: isActive("/user-management") },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-indigo-900/30 to-slate-900 border-r-2 border-purple-500/30 flex-shrink-0 sidebar-transition backdrop-blur-md shadow-xl relative overflow-hidden" data-testid="sidebar">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'w-1 h-1 bg-purple-400/30 animate-pulse' :
                i % 3 === 1 ? 'w-2 h-2 bg-cyan-400/20 animate-ping' :
                'w-1 h-1 bg-orange-400/20 animate-bounce'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Enhanced Profile Section */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <Badge 
                  className={`text-xs mt-1 ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    user.role === 'topper' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                  data-testid="sidebar-user-role"
                >
                  {user.role === 'admin' ? '👑 Admin' :
                   user.role === 'topper' ? '⭐ Topper' :
                   user.role === 'reviewer' ? '🔍 Reviewer' :
                   '🎓 Student'}
                </Badge>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-purple-500/10 rounded-lg p-2">
                <div className="text-xs text-purple-300 font-medium">Notes</div>
                <div className="text-sm font-bold text-white">0</div>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-2">
                <div className="text-xs text-cyan-300 font-medium">Points</div>
                <div className="text-sm font-bold text-white">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              🏠 Main Navigation
            </h3>
            <nav className="space-y-2">
              {studentLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                    link.active 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'hover:bg-black/30 text-gray-300 hover:text-white border border-transparent hover:border-purple-500/30'
                  }`}
                  data-testid={`sidebar-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                  {link.active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>



          {/* My Activity Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              📊 My Activity
            </h3>
            <nav className="space-y-2">
              {myActivityLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                    link.active 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                      : 'hover:bg-black/30 text-gray-300 hover:text-white border border-transparent hover:border-green-500/30'
                  }`}
                  data-testid={`sidebar-activity-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                  {link.badge && (
                    <Badge className="ml-auto bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1 rounded-full">
                      {link.badge}
                    </Badge>
                  )}
                  {link.active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Topper Studio */}
          {(user.role === 'topper' || user.role === 'admin') && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Topper Studio
              </h3>
              <nav className="space-y-2">
                {topperLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      link.active 
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/30' 
                        : 'hover:bg-black/30 text-gray-300 hover:text-white border border-transparent hover:border-yellow-500/30'
                    }`}
                    data-testid={`sidebar-topper-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">⭐ {link.label}</span>
                    {link.active && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Review/Admin */}
          {(user.role === 'reviewer' || user.role === 'admin') && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                {user.role === 'admin' ? 'Admin' : 'Review'}
              </h3>
              <nav className="space-y-2">
                {/* Enhanced Review Queue for both reviewers and admins */}
                <Link 
                  href="/review-queue"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isActive('/review-queue') 
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30' 
                      : 'hover:bg-black/30 text-gray-300 hover:text-white border border-transparent hover:border-red-500/30'
                  }`}
                  data-testid="sidebar-link-review-queue"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span className="text-sm font-medium">🔍 Review Queue</span>
                  <Badge className="ml-auto bg-red-500/20 text-red-300 border-red-500/30 text-xs px-2 py-1 rounded-full animate-pulse">
                    3
                  </Badge>
                  {isActive('/review-queue') && (
                    <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>

                {/* Enhanced Admin-only links */}
                {user.role === 'admin' && adminLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      link.active 
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/30' 
                        : 'hover:bg-black/30 text-gray-300 hover:text-white border border-transparent hover:border-red-500/30'
                    }`}
                    data-testid={`sidebar-admin-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">👑 {link.label}</span>
                    {link.active && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Enhanced Subscription Upgrade */}
          {user.role === 'student' && (
            <div className="pt-6 border-t border-purple-500/20">
              <Link 
                href="/subscribe"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30"
                data-testid="sidebar-link-upgrade"
                style={{
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)',
                  filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))'
                }}
              >
                <Crown className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-bold">👑 Upgrade to Premium</span>
              </Link>
            </div>
          )}
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div className="p-6 border-t border-purple-500/20">
          {/* Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-white border-red-500/30 hover:border-red-400 hover:bg-red-900/20 transition-all duration-300 hover:scale-105 rounded-xl py-3"
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
