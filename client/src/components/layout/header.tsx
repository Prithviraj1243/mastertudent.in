import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ProfileIcon from "@/components/profile-icon";
import { 
  GraduationCap, 
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { ActivityNotificationBell } from "@/components/activity-notifications";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <header className="bg-slate-900/95 border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-gray-800/20 to-slate-700/30 animate-study-pulse"></div>
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Left - Logo with Text */}
          <div className="flex items-center -ml-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 group transition-all duration-300">
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

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* User Activity Link */}
            <Link href="/my-activity">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
              >
                <Activity className="h-5 w-5" />
              </Button>
            </Link>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
            >
              <ActivityNotificationBell />
            </Button>

            {/* Profile Icon */}
            <ProfileIcon />

          </div>
        </div>
      </div>
    </header>
  );
}
