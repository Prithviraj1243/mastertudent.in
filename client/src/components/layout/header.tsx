import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Crown, 
  Bell, 
  Search,
  Menu,
  LogOut,
  Coins,
  Download,
  TrendingUp,
  Gift
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch coin balance
  const { data: coinBalance } = useQuery({
    queryKey: ['/api/coins/balance'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-gradient-primary border-b-2 border-purple-200 sticky top-0 z-50 shadow-lg" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover-scale" data-testid="link-home">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg animate-glow">
                <GraduationCap className="text-purple-600 text-lg" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">MasterStudent</span>
                <div className="text-xs text-white/80">🎓 Learn • Excel • Succeed</div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2 ml-8">
              <Link href="/catalog" className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all hover-scale font-medium" data-testid="link-catalog">
                📚 Browse Notes
              </Link>
              <Link href="/forum" className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all hover-scale font-medium" data-testid="link-forum">
                💬 Discussions
              </Link>
              <Link href="/leaderboard" className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all hover-scale font-medium" data-testid="link-leaderboard">
                🏆 Leaderboard
              </Link>
              {(user.role === 'topper' || user.role === 'admin') && (
                <Link href="/upload" className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all hover-scale font-medium" data-testid="link-upload">
                  ⭐ Upload Notes
                </Link>
              )}
              {user.role === 'topper' && (
                <Link href="/analytics" className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all hover-scale font-medium" data-testid="link-analytics">
                  📊 Analytics
                </Link>
              )}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop only */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
                  data-testid="input-header-search"
                />
              </div>
            </div>

            {/* Coin Balance */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Main Coin Balance */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-xl border border-yellow-300/30 backdrop-blur-sm hover-scale cursor-pointer">
                <div className="relative">
                  <Coins className="text-yellow-500 h-5 w-5 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-yellow-600 leading-none" data-testid="text-coin-balance">
                    {coinBalance?.coinBalance?.toLocaleString() || '100'}
                  </span>
                  <span className="text-xs text-yellow-500/80 leading-none">coins</span>
                </div>
              </div>

              {/* Free Downloads */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-2 rounded-lg border border-green-300/30">
                <Download className="text-green-500 h-4 w-4" />
                <span className="text-sm font-medium text-green-600" data-testid="text-free-downloads">
                  {coinBalance?.freeDownloadsLeft ?? '3'} free
                </span>
              </div>

              {/* Streak Indicator */}
              {coinBalance?.streak && coinBalance.streak > 0 && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-2 rounded-lg border border-purple-300/30">
                  <TrendingUp className="text-purple-500 h-4 w-4" />
                  <span className="text-sm font-medium text-purple-600" data-testid="text-streak">
                    {coinBalance.streak} 🔥
                  </span>
                </div>
              )}
            </div>

            {/* Subscription Status */}
            <div className="hidden md:flex items-center space-x-2 bg-muted px-3 py-1 rounded-md">
              <Crown className="text-secondary text-sm" />
              <span className="text-sm font-medium text-muted-foreground" data-testid="text-subscription-status">
                Premium Active
              </span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              {user.role !== 'student' && (
                <Badge 
                  variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                  className="hidden sm:inline-flex"
                  data-testid="badge-user-role"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <Avatar 
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  data-testid="avatar-user"
                >
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-md shadow-lg py-1 z-50" data-testid="dropdown-user-menu">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Mobile Coin Stats */}
                    <div className="px-4 py-3 border-b border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Coins className="text-yellow-500 h-4 w-4" />
                          <span className="text-sm font-medium">Coins</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-600" data-testid="mobile-coin-balance">
                          {coinBalance?.coinBalance?.toLocaleString() || '100'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Download className="text-green-500 h-4 w-4" />
                          <span className="text-sm font-medium">Free Downloads</span>
                        </div>
                        <span className="text-sm font-medium text-green-600" data-testid="mobile-free-downloads">
                          {coinBalance?.freeDownloadsLeft ?? '3'}
                        </span>
                      </div>
                      {coinBalance?.streak && coinBalance.streak > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="text-purple-500 h-4 w-4" />
                            <span className="text-sm font-medium">Streak</span>
                          </div>
                          <span className="text-sm font-medium text-purple-600" data-testid="mobile-streak">
                            {coinBalance.streak} 🔥
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="md:hidden">
                      <Link 
                        href="/catalog" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setShowMobileMenu(false)}
                        data-testid="mobile-link-catalog"
                      >
                        📚 Browse Notes
                      </Link>
                      <Link 
                        href="/forum" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setShowMobileMenu(false)}
                        data-testid="mobile-link-forum"
                      >
                        💬 Discussions
                      </Link>
                      <Link 
                        href="/leaderboard" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setShowMobileMenu(false)}
                        data-testid="mobile-link-leaderboard"
                      >
                        🏆 Leaderboard
                      </Link>
                      <Link 
                        href="/coin-dashboard" 
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setShowMobileMenu(false)}
                        data-testid="mobile-link-coins"
                      >
                        🪙 Coin Dashboard
                      </Link>
                      {(user.role === 'topper' || user.role === 'admin') && (
                        <Link 
                          href="/upload" 
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setShowMobileMenu(false)}
                          data-testid="mobile-link-upload"
                        >
                          Upload Notes
                        </Link>
                      )}
                      {(user.role === 'reviewer' || user.role === 'admin') && (
                        <Link 
                          href="/review-queue" 
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setShowMobileMenu(false)}
                          data-testid="mobile-link-review"
                        >
                          Review Queue
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setShowMobileMenu(false)}
                          data-testid="mobile-link-admin"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'topper' && (
                        <Link 
                          href="/analytics" 
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setShowMobileMenu(false)}
                          data-testid="mobile-link-analytics"
                        >
                          Analytics
                        </Link>
                      )}
                      <hr className="my-1" />
                    </div>

                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent text-left"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden border-t border-border px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="input-mobile-search"
          />
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </header>
  );
}
