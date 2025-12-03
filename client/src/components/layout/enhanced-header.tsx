import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  BookOpen, 
  Home, 
  Upload, 
  Download,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { Link } from 'wouter';

interface EnhancedHeaderProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function EnhancedHeader({ onMenuToggle }: EnhancedHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle?.(!isMenuOpen);
  };

  const menuItems = [
    { icon: Download, label: 'Download Notes', href: '/download-notes' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Award, label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-500/20 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/">
              <a className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MasterStudent
                  </h1>
                  <p className="text-xs text-blue-300/70">EdTech Platform</p>
                </div>
              </a>
            </Link>

            {/* Center Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-blue-100 placeholder:text-blue-400/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-blue-500/10 rounded-lg transition-all duration-300 group">
                <Bell className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </button>


              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group"
                >
                  {typeof window !== 'undefined' && localStorage.getItem('userProfilePic') ? (
                    <img 
                      src={localStorage.getItem('userProfilePic') || ''} 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-blue-500/20">
                      <p className="text-sm font-semibold text-blue-300">{typeof window !== 'undefined' ? localStorage.getItem('userName') || 'User' : 'User'}</p>
                      <p className="text-xs text-blue-400/70">{typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'user@example.com' : 'user@example.com'}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <a href="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-blue-500/10 rounded transition-colors duration-200 text-blue-300 hover:text-blue-200">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Profile</span>
                      </a>
                      <a href="/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-blue-500/10 rounded transition-colors duration-200 text-blue-300 hover:text-blue-200">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Settings</span>
                      </a>
                      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded transition-colors duration-200 text-red-400 hover:text-red-300">
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-blue-400" />
                ) : (
                  <Menu className="h-5 w-5 text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-blue-500/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="flex items-center gap-3 px-4 py-2 hover:bg-blue-500/10 rounded-lg transition-colors duration-200 text-blue-300 hover:text-blue-200">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-20 md:w-64 md:h-[calc(100vh-80px)] md:bg-gradient-to-b md:from-slate-900 md:to-slate-900/50 md:border-r md:border-blue-500/20 md:backdrop-blur-md md:overflow-y-auto md:z-40 md:flex md:flex-col md:pt-6">
        <nav className="space-y-2 px-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-blue-300 hover:text-blue-200 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 group">
                <item.icon className="h-5 w-5 group-hover:text-blue-400 transition-colors duration-300" />
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

      </aside>
    </>
  );
}
