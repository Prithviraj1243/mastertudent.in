import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  MapPin, 
  Calendar,
  X, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProfileCompletionPromptProps {
  onDismiss?: () => void;
  autoShow?: boolean;
  placement?: 'top-right' | 'center' | 'bottom';
}

export default function ProfileCompletionPrompt({ 
  onDismiss, 
  autoShow = true,
  placement = 'top-right'
}: ProfileCompletionPromptProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  // Calculate profile completion percentage
  useEffect(() => {
    if (user) {
      let score = 0;
      const fields = [
        user.firstName,
        user.lastName, 
        user.email,
        user.phone,
        user.profileImageUrl,
        // Add more fields as needed
      ];
      
      const filledFields = fields.filter(field => field && field.trim() !== '').length;
      score = Math.round((filledFields / fields.length) * 100);
      setCompletionScore(score);
      
      // Show prompt if profile is incomplete and user signed in with Google
      const isGoogleUser = user.email?.includes('@gmail.com') || 
                          sessionStorage.getItem('userEmail')?.includes('@gmail.com');
      
      if (autoShow && score < 80 && isGoogleUser) {
        const hasSeenPrompt = localStorage.getItem('profilePromptSeen');
        if (!hasSeenPrompt) {
          setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
          }, 2000); // Show after 2 seconds
        }
      }
    }
  }, [user, autoShow]);

  const handleDismiss = () => {
    setIsAnimating(false);
    localStorage.setItem('profilePromptSeen', 'true');
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const handleCompleteProfile = () => {
    localStorage.setItem('profilePromptSeen', 'true');
    // Navigate to profile update page
  };

  if (!isVisible || !user) {
    return null;
  }

  const isGoogleUser = user.email?.includes('@gmail.com') || 
                      sessionStorage.getItem('userEmail')?.includes('@gmail.com');

  const getPositionClasses = () => {
    switch (placement) {
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom':
        return 'fixed bottom-4 right-4';
      default:
        return 'fixed top-4 right-4';
    }
  };

  return (
    <div className={`${getPositionClasses()} z-50 max-w-md`}>
      <Card className={`bg-gradient-to-r from-indigo-900/95 to-purple-900/95 backdrop-blur-md border border-indigo-500/50 shadow-2xl transition-all duration-300 ${
        isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Complete Your Profile</CardTitle>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs mt-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {completionScore}% Complete
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google User Info */}
          {isGoogleUser && (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white mb-2">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="font-medium text-sm">Google Account Connected</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-white/80 text-sm">
                <p>📧 {user.email || sessionStorage.getItem('userEmail')}</p>
                <p>👤 {user.firstName} {user.lastName}</p>
              </div>
            </div>
          )}

          {/* Missing Information */}
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              Complete Your Profile
            </h4>
            
            <div className="space-y-2 text-sm">
              {!user.phone && (
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="h-3 w-3 text-blue-400" />
                  <span>Add phone number</span>
                </div>
              )}
              
              {(!user.profileImageUrl || user.profileImageUrl === '') && (
                <div className="flex items-center gap-2 text-white/80">
                  <User className="h-3 w-3 text-purple-400" />
                  <span>Upload profile picture</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-white/80">
                <School className="h-3 w-3 text-green-400" />
                <span>Add education details</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-3 w-3 text-red-400" />
                <span>Add location information</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-green-300 text-sm font-medium">Profile Benefits</span>
            </div>
            <ul className="text-green-200/80 text-xs space-y-1">
              <li>• Better note recommendations</li>
              <li>• Personalized study materials</li>
              <li>• Connect with nearby students</li>
              <li>• Enhanced profile visibility</li>
            </ul>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Profile Completion</span>
              <span className="text-white font-medium">{completionScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium"
              onClick={handleCompleteProfile}
            >
              <Link href="/profile-update">
                <Edit className="h-4 w-4 mr-2" />
                Complete Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="border-white/30 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Later
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-white/50 text-xs text-center">
            🔒 Your information is secure and private
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
