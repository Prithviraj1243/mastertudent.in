import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Settings, 
  Crown,
  Mail,
  Phone,
  ChevronDown,
  Sparkles,
  Coins,
  Download,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
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

export default function ProfileIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  useEffect(() => {
    // Check for Google user data in sessionStorage
    const googleEmail = sessionStorage.getItem('userEmail');
    const googleName = sessionStorage.getItem('userName');
    const googlePicture = sessionStorage.getItem('userPicture');
    
    if (googleEmail && googleName) {
      setGoogleUser({
        name: googleName,
        email: googleEmail,
        picture: googlePicture || undefined,
        given_name: googleName.split(' ')[0],
        family_name: googleName.split(' ').slice(1).join(' ')
      });
      setIsGoogleAuth(true);
    } else {
      // Fallback to default user
      setGoogleUser({
        name: 'Student User',
        email: 'student@masterstudent.com'
      });
      setIsGoogleAuth(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!googleUser) return null;

  return (
    <div className="relative">
      {/* Profile Avatar Button */}
      <Button
        variant="ghost"
        className="relative h-10 w-10 rounded-full p-0 hover:bg-slate-700/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-9 w-9 border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          {googleUser.picture && (
            <AvatarImage 
              src={googleUser.picture} 
              alt={googleUser.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">
            {getInitials(googleUser.name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Google Badge */}
        {isGoogleAuth && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-600">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        )}
        
        {/* Dropdown Arrow */}
        <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-slate-400" />
      </Button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl z-50"
            >
              {/* User Info Header */}
              <div className="p-6 border-b border-slate-600/50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                    {googleUser.picture && (
                      <AvatarImage 
                        src={googleUser.picture} 
                        alt={googleUser.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold">
                      {getInitials(googleUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {googleUser.name}
                      </h3>
                      {isGoogleAuth && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Google
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 flex items-center gap-2">
                      {googleUser.email}
                      {isGoogleAuth && (
                        <span className="text-green-400">✓</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 border-b border-slate-600/50 bg-gradient-to-r from-slate-700/20 to-purple-900/20">
                <div className="grid grid-cols-3 gap-3">
                  {/* Coins */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-lg font-bold text-yellow-300">0</span>
                    </div>
                    <p className="text-xs text-slate-400">Coins</p>
                  </div>
                  
                  {/* Downloads */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Download className="h-4 w-4 text-green-400 mr-1" />
                      <span className="text-lg font-bold text-green-300">0</span>
                    </div>
                    <p className="text-xs text-slate-400">Downloads</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-orange-400 mr-1" />
                      <span className="text-lg font-bold text-orange-300">0</span>
                    </div>
                    <p className="text-xs text-slate-400">Rating</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/profile';
                  }}
                >
                  <User className="h-4 w-4 mr-3" />
                  My Profile
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/settings';
                  }}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/premium';
                  }}
                >
                  <Crown className="h-4 w-4 mr-3 text-yellow-500" />
                  Upgrade to Pro
                  <Sparkles className="h-3 w-3 ml-auto text-yellow-400" />
                </Button>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-slate-600/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
