import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Coins, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get admin user from sessionStorage (admin auth is completely independent from main website)
  const adminUser = typeof window !== 'undefined' 
    ? JSON.parse(sessionStorage.getItem('adminUser') || '{}')
    : {};
  
  // Check admin authentication
  const isAdminAuthenticated = typeof window !== 'undefined' 
    ? sessionStorage.getItem('adminAuth') === 'true' && sessionStorage.getItem('adminToken')
    : false;
  
  const displayUser = adminUser.username ? adminUser : null;

  // Check admin authentication on mount
  useEffect(() => {
    const validateAdminSession = async () => {
      if (!isAdminAuthenticated) {
        toast({
          title: 'Access Denied',
          description: 'Please log in to access admin panel',
          variant: 'destructive',
        });
        setLocation('/admin/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/check-session', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data?.authenticated) {
          sessionStorage.removeItem('adminAuth');
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminUser');
          toast({
            title: 'Session Expired',
            description: 'Please log in again.',
            variant: 'destructive',
          });
          setLocation('/admin/login');
        }
      } catch {
        setLocation('/admin/login');
      }
    };

    validateAdminSession();
  }, [isAdminAuthenticated, setLocation, toast]);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Notes Management', path: '/admin/notes', badge: 5 },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Coins, label: 'Coin Management', path: '/admin/coins' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      // Call admin logout endpoint (separate from main website logout)
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear ONLY admin session data (don't touch main website auth)
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      
      toast({
        title: 'Logged Out',
        description: 'Successfully logged out of admin panel',
      });
      setLocation('/admin/login');
    } catch (error) {
      console.error('Admin logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'Could not log out properly',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="text-white font-bold text-lg">Admin Panel</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center ${
                  sidebarOpen ? 'justify-start px-4' : 'justify-center'
                } py-3 mb-1 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 p-4">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {displayUser?.firstName?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {displayUser?.firstName} {displayUser?.lastName}
                  </p>
                  <p className="text-slate-400 text-xs truncate">{displayUser?.email || 'admin@masterstudent.in'}</p>
                  <p className="text-blue-400 text-xs font-semibold uppercase">🎖️ {displayUser?.role || 'Admin'}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 text-slate-400 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-px h-6 bg-slate-700"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {displayUser?.fullName || displayUser?.username || 'Admin User'}
                </p>
                <p className="text-slate-400 text-xs">{displayUser?.email || 'admin@masterstudent.in'}</p>
                <p className="text-red-400 text-xs font-semibold uppercase">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {displayUser?.username?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
