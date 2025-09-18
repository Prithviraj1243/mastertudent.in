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
  Gift,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import logoImage from "/src/assets/logo.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();
  
  const handleBack = () => {
    window.history.back();
  };
  
  // Show back button on pages other than home
  const showBackButton = location !== "/" && location !== "/login" && location !== "/onboarding";

  // Fetch coin balance
  const { data: coinBalance } = useQuery<{
    coinBalance: number;
    freeDownloadsLeft: number;
    totalEarned: number;
    totalSpent: number;
    reputation: number;
    streak: number;
  }>({
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
    <header className="bg-white/95 border-b border-pink-300/50 sticky top-0 z-50 backdrop-blur-md" data-testid="app-header">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 via-purple-100/30 to-cyan-100/30 animate-study-pulse"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-2 bg-study-card border border-slate-600/30 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white transition-all duration-300"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center space-x-3 hover-study-card group animate-interactive-hover" data-testid="link-home">
              <div className="relative w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={logoImage}
                  alt="MasterStudent Logo" 
                  className="w-full h-full object-contain rounded-3xl"
                />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                  MasterStudent
                </span>
                <div className="text-xs text-purple-600/80 font-medium tracking-wide">
                  ⚡ Learn • Share • Excel
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 ml-6">
              <Link href="/catalog" className="px-3 py-2 text-pink-700 hover:text-white hover:bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-pink-400 animate-interactive-hover" data-testid="link-catalog">
                📚 Browse Notes
              </Link>
              <Link href="/forum" className="px-3 py-2 text-purple-700 hover:text-white hover:bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-purple-400 animate-interactive-hover" data-testid="link-forum">
                💬 Community
              </Link>
              <Link href="/leaderboard" className="px-3 py-2 text-orange-700 hover:text-white hover:bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-orange-400 animate-interactive-hover" data-testid="link-leaderboard">
                🏆 Leaderboard
              </Link>
              <Link href="/coin-dashboard" className="px-3 py-2 text-emerald-700 hover:text-white hover:bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-emerald-400 animate-interactive-hover" data-testid="link-coin-dashboard">
                💰 My Coins
              </Link>
              {(user.role === 'topper' || user.role === 'admin') && (
                <Link href="/upload" className="px-3 py-2 text-slate-200 hover:text-white hover:bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-indigo-500/30" data-testid="link-upload">
                  ⭐ Upload Notes
                </Link>
              )}
              {user.role === 'topper' && (
                <Link href="/uploader-profile" className="px-3 py-2 text-green-700 hover:text-white hover:bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-green-400 animate-interactive-hover" data-testid="link-uploader-profile">
                  💰 My Wallet
                </Link>
              )}
              {user.role === 'topper' && (
                <Link href="/analytics" className="px-3 py-2 text-slate-200 hover:text-white hover:bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-red-500/30" data-testid="link-analytics">
                  📊 Analytics
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/review-queue" className="px-3 py-2 text-amber-700 hover:text-white hover:bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-amber-400 animate-interactive-hover" data-testid="link-review-queue">
                  🔍 Review Queue
                </Link>
              )}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Desktop only */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-48"
                  data-testid="input-header-search"
                />
              </div>
            </div>

            {/* Study Stats */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Main Coin Balance */}
              <div className="relative overflow-hidden group">
                <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 bg-study-card px-3 py-2 rounded-2xl border border-yellow-500/20 hover-glow-intense cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Coins className="text-yellow-400 h-5 w-5 animate-study-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-yellow-300 leading-none animate-number-counter" data-testid="text-coin-balance">
                        {coinBalance?.coinBalance?.toLocaleString() || '1,250'}
                      </span>
                      <span className="text-xs text-yellow-400/70 leading-none font-medium tracking-wider">COINS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Downloads */}
              <div className="bg-study-card px-2 py-2 rounded-xl border border-green-500/20 hover-neon group">
                <div className="flex items-center space-x-2">
                  <Download className="text-green-400 h-5 w-5 group-hover:animate-bounce" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-300" data-testid="text-free-downloads">
                      {coinBalance?.freeDownloadsLeft ?? '3'}
                    </span>
                    <span className="text-xs text-green-400/70 font-medium">FREE</span>
                  </div>
                </div>
              </div>

              {/* Study Streak */}
              {coinBalance?.streak && coinBalance.streak > 0 && (
                <div className="bg-study-card px-2 py-2 rounded-xl border border-orange-500/20 hover-neon group">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-orange-400 h-5 w-5 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-orange-300" data-testid="text-streak">
                        {coinBalance.streak}
                      </span>
                      <span className="text-xs text-orange-400/70 font-medium">STREAK</span>
                    </div>
                    <div className="text-lg animate-float-subtle">🔥</div>
                  </div>
                </div>
              )}

              {/* Study Status Indicator */}
              <div className="bg-study-card px-3 py-2 rounded-xl border border-cyan-500/20 hover-neon min-w-fit">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span className="text-xs text-cyan-300 font-medium whitespace-nowrap">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Premium Status */}
            <div className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 bg-study-card px-2 py-1 rounded-xl border border-purple-500/30 hover-neon">
              <Crown className="text-purple-400 h-4 w-4 animate-float-subtle" />
              <span className="text-xs font-bold text-purple-300" data-testid="text-subscription-status">
                PRO
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="bg-study-card border border-slate-600/30 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white transition-all duration-300" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 hover:border-red-400/50 hover:bg-red-500/30 text-red-300 hover:text-white transition-all duration-300 font-medium"
              data-testid="button-signout-main"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
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
                        💬 Community
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
                        🪙 My Coins
                      </Link>
                      {(user.role === 'topper' || user.role === 'admin') && (
                        <Link 
                          href="/upload" 
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setShowMobileMenu(false)}
                          data-testid="mobile-link-upload"
                        >
                          📚 Upload Notes
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
