import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Sparkles, 
  MapPin, 
  School, 
  Target, 
  X, 
  ArrowRight,
  Clock,
  CheckCircle,
  Zap
} from "lucide-react";
import { Link } from "wouter";

interface PhoneSignupNotificationProps {
  phoneNumber?: string;
  onDismiss?: () => void;
  autoShow?: boolean;
}

export default function PhoneSignupNotification({ 
  phoneNumber, 
  onDismiss, 
  autoShow = true 
}: PhoneSignupNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoShow && phoneNumber) {
      // Show notification after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoShow, phoneNumber]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible || !phoneNumber) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className={`bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-md border border-purple-500/50 shadow-2xl transition-all duration-300 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Smart Profile Setup!</h3>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Phone Detected
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

          {/* Phone Number Display */}
          <div className="bg-white/10 rounded-lg p-3 mb-4 border border-white/20">
            <div className="flex items-center gap-2 text-white">
              <Phone className="h-4 w-4 text-green-400" />
              <span className="font-mono text-sm">{phoneNumber}</span>
              <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-white/90">
              <div className="bg-blue-500/20 p-1.5 rounded">
                <MapPin className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Auto-detect Location</p>
                <p className="text-xs text-white/60">City, state & pincode</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-white/90">
              <div className="bg-purple-500/20 p-1.5 rounded">
                <School className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Suggest Schools</p>
                <p className="text-xs text-white/60">Nearby institutions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-white/90">
              <div className="bg-orange-500/20 p-1.5 rounded">
                <Target className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Match Interests</p>
                <p className="text-xs text-white/60">Personalized subjects</p>
              </div>
            </div>
          </div>

          {/* Time Saver Badge */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 mb-4 border border-green-500/30">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Save 5+ minutes</span>
              <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-green-200/80 text-xs mt-1">
              Complete your profile in under 30 seconds!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium"
            >
              <Link href="/profile-update">
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-Fill Now
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
          <p className="text-white/50 text-xs mt-3 text-center">
            🔒 Your phone number is used only for smart suggestions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
