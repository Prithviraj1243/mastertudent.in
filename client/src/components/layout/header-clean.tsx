import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ProfileIcon from "@/components/profile-icon";
import { 
  GraduationCap, 
  Bell, 
  Search
} from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <header className="bg-slate-900/95 border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-gray-800/20 to-slate-700/30 animate-study-pulse"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          
          {/* Left - Logo with Text */}
          <div className="flex items-center flex-shrink-0 mr-8">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 group transition-all duration-300">
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600">
                <GraduationCap className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:via-red-300 group-hover:to-pink-300 transition-all duration-300">
                  MasterStudent
                </span>
                <div className="text-xs text-orange-300 font-medium tracking-wider uppercase">
                  ⚡ Learn • Share • Excel
                </div>
              </div>
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 flex justify-center px-4 sm:px-8">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search notes, subjects, topics..."
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-600 rounded-2xl bg-slate-800/90 text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-xl placeholder-gray-400"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-slate-700 border border-slate-600 rounded">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Profile Icon */}
            <ProfileIcon />

          </div>
        </div>
      </div>
    </header>
  );
}
