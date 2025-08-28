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
    <header className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-b border-orange-300/50 sticky top-0 z-50 backdrop-blur-md" data-testid="app-header">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-300/30 via-pink-300/30 to-purple-300/30 animate-trading-pulse"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover-trading-card group animate-interactive-hover" data-testid="link-home">
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-2xl animate-glow-pulse">
                <GraduationCap className="text-white text-xl group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  MasterStudent
                </span>
                <div className="text-xs text-gray-600 font-medium tracking-wide animate-colorPulse">
                  ⚡ TRADE • LEARN • EARN
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 ml-8">
              <Link href="/catalog" className="px-4 py-2 text-orange-600 hover:text-white hover:bg-gradient-to-r from-orange-400/80 to-pink-400/80 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-orange-400 animate-interactive-hover shadow-lg" data-testid="link-catalog">
                📚 Market
              </Link>
              <Link href="/forum" className="px-4 py-2 text-purple-600 hover:text-white hover:bg-gradient-to-r from-purple-400/80 to-indigo-400/80 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-purple-400 animate-interactive-hover shadow-lg" data-testid="link-forum">
                💬 Hub
              </Link>
              <Link href="/leaderboard" className="px-4 py-2 text-yellow-600 hover:text-white hover:bg-gradient-to-r from-yellow-400/80 to-orange-400/80 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-yellow-400 animate-interactive-hover shadow-lg" data-testid="link-leaderboard">
                🏆 Ranks
              </Link>
              <Link href="/coin-dashboard" className="px-4 py-2 text-emerald-600 hover:text-white hover:bg-gradient-to-r from-emerald-400/80 to-teal-400/80 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-emerald-400 animate-interactive-hover shadow-lg" data-testid="link-coin-dashboard">
                💰 Portfolio
              </Link>
              {(user.role === 'topper' || user.role === 'admin') && (
                <Link href="/upload" className="px-4 py-2 text-slate-200 hover:text-white hover:bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-indigo-500/30" data-testid="link-upload">
                  ⭐ Trade
                </Link>
              )}
              {user.role === 'topper' && (
                <Link href="/analytics" className="px-4 py-2 text-slate-200 hover:text-white hover:bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl transition-all hover-neon font-medium border border-transparent hover:border-red-500/30" data-testid="link-analytics">
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

            {/* Trading-Style Stats */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Main Coin Balance - Trading Style */}
              <div className="relative overflow-hidden group">
                <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 bg-trading-card px-4 py-3 rounded-2xl border border-yellow-500/20 hover-glow-intense cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Coins className="text-yellow-400 h-6 w-6 animate-trading-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-yellow-300 leading-none animate-number-counter" data-testid="text-coin-balance">
                        {coinBalance?.coinBalance?.toLocaleString() || '1,250'}
                      </span>
                      <span className="text-xs text-yellow-400/70 leading-none font-medium tracking-wider">COINS</span>
                    </div>
                    <div className="text-xs text-green-400 font-bold animate-value-up">
                      +12%
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Downloads - Trading Style */}
              <div className="bg-trading-card px-3 py-3 rounded-xl border border-green-500/20 hover-neon group">
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

              {/* Streak Indicator - Trading Style */}
              {coinBalance?.streak && coinBalance.streak > 0 && (
                <div className="bg-trading-card px-3 py-3 rounded-xl border border-orange-500/20 hover-neon group">
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

              {/* Live Market Indicator */}
              <div className="bg-trading-card px-3 py-3 rounded-xl border border-cyan-500/20 hover-neon">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span className="text-xs text-cyan-300 font-medium">LIVE</span>
                </div>
              </div>
            </div>

            {/* Premium Status - Trading Style */}
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 bg-trading-card px-3 py-2 rounded-xl border border-purple-500/30 hover-neon">
              <Crown className="text-purple-400 h-4 w-4 animate-float-subtle" />
              <span className="text-sm font-bold text-purple-300" data-testid="text-subscription-status">
                PRO
              </span>
            </div>

            {/* Notifications - Trading Style */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="bg-trading-card border border-slate-600/30 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white transition-all duration-300" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </div>

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
