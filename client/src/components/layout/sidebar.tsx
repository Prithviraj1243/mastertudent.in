import { useAuth } from "@/hooks/useAuth";
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
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path: string) => location === path;

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback - redirect anyway
      window.location.href = '/';
    }
  };

  const studentLinks = [
    { path: "/catalog", icon: BookOpen, label: "Browse Notes", active: isActive("/catalog") || isActive("/") },
    { path: "/downloads", icon: Download, label: "My Downloads", active: isActive("/downloads") },
    { path: "/following", icon: Heart, label: "Following", active: isActive("/following") },
    { path: "/profile", icon: User, label: "My Profile", active: isActive("/profile") },
  ];

  const topperLinks = [
    { path: "/upload", icon: Plus, label: "Upload Notes", active: isActive("/upload") },
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
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 sidebar-transition" data-testid="sidebar">
      <div className="p-6">
        <div className="space-y-6">
          {/* Student Portal */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Student Portal
            </h3>
            <nav className="space-y-2">
              {studentLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    link.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent text-foreground'
                  }`}
                  data-testid={`sidebar-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Topper Studio */}
          {(user.role === 'topper' || user.role === 'admin') && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Topper Studio
              </h3>
              <nav className="space-y-2">
                {topperLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      link.active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent text-foreground'
                    }`}
                    data-testid={`sidebar-topper-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Review/Admin */}
          {(user.role === 'reviewer' || user.role === 'admin') && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {user.role === 'admin' ? 'Admin' : 'Review'}
              </h3>
              <nav className="space-y-2">
                {/* Review Queue for both reviewers and admins */}
                <Link 
                  href="/review-queue"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive('/review-queue') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent text-foreground'
                  }`}
                  data-testid="sidebar-link-review-queue"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-sm font-medium">Review Queue</span>
                  <Badge variant="secondary" className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                    3
                  </Badge>
                </Link>

                {/* Admin-only links */}
                {user.role === 'admin' && adminLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      link.active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent text-foreground'
                    }`}
                    data-testid={`sidebar-admin-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Subscription Upgrade */}
          {user.role === 'student' && (
            <div className="pt-6 border-t border-border">
              <Link 
                href="/subscribe"
                className="flex items-center space-x-3 px-3 py-2 rounded-md bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity"
                data-testid="sidebar-link-upgrade"
              >
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Upgrade to Premium</span>
              </Link>
            </div>
          )}

          {/* User Role Display */}
          <div className="pt-6 border-t border-border">
            <div className="px-3 py-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <Badge 
                variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                className="mt-1 text-xs"
                data-testid="sidebar-user-role"
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            
            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center space-x-2 text-muted-foreground hover:text-foreground border-border hover:border-red-300 hover:bg-red-50"
              data-testid="button-sign-out"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
