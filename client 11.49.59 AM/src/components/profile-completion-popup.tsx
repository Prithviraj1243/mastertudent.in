import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Edit3,
  Star
} from 'lucide-react';
import { Link } from "wouter";

interface ProfileCompletionPopupProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ProfileCompletionPopup({ 
  user, 
  isOpen, 
  onClose, 
  onComplete 
}: ProfileCompletionPopupProps) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      calculateCompletion();
    }
  }, [user]);

  const calculateCompletion = () => {
    const requiredFields = [
      { key: 'firstName', label: 'First Name', value: user?.firstName },
      { key: 'lastName', label: 'Last Name', value: user?.lastName },
      { key: 'email', label: 'Email', value: user?.email },
      { key: 'phone', label: 'Phone Number', value: user?.phone },
      { key: 'dateOfBirth', label: 'Date of Birth', value: user?.dateOfBirth },
      { key: 'address', label: 'Address', value: user?.address },
      { key: 'city', label: 'City', value: user?.city },
      { key: 'state', label: 'State', value: user?.state },
      { key: 'education', label: 'Education Level', value: user?.education },
      { key: 'institution', label: 'Institution', value: user?.institution },
      { key: 'bio', label: 'Bio', value: user?.bio },
      { key: 'interests', label: 'Interests', value: user?.interests }
    ];

    const completedFields = requiredFields.filter(field => 
      field.value && field.value.toString().trim() !== ''
    );
    
    const missing = requiredFields.filter(field => 
      !field.value || field.value.toString().trim() === ''
    ).map(field => field.label);

    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
    
    setCompletionPercentage(percentage);
    setMissingFields(missing);
  };

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'from-green-500 to-emerald-500';
    if (completionPercentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompletionMessage = () => {
    if (completionPercentage >= 80) return 'Almost there! Just a few more details.';
    if (completionPercentage >= 50) return 'Good progress! Let\'s complete your profile.';
    return 'Let\'s get your profile set up properly!';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 text-sm">
                {getCompletionMessage()}
              </p>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Profile Completion</span>
                <Badge className={`bg-gradient-to-r ${getCompletionColor()} text-white border-0`}>
                  {completionPercentage}%
                </Badge>
              </div>
              
              <Progress 
                value={completionPercentage} 
                className="h-3 bg-slate-800"
              />
              
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                {12 - missingFields.length} of 12 fields completed
              </div>
            </div>

            {/* Missing Fields */}
            {missingFields.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <AlertCircle className="h-4 w-4 text-orange-400 mr-2" />
                  <span className="text-sm font-medium text-gray-300">
                    Missing Information
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {missingFields.slice(0, 6).map((field, index) => (
                    <div 
                      key={index}
                      className="flex items-center text-xs text-gray-400 bg-slate-800/50 rounded-md p-2"
                    >
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      {field}
                    </div>
                  ))}
                  {missingFields.length > 6 && (
                    <div className="flex items-center text-xs text-gray-400 bg-slate-800/50 rounded-md p-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      +{missingFields.length - 6} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Complete your profile to unlock:
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Star, text: 'Personalized recommendations', color: 'text-yellow-400' },
                  { icon: GraduationCap, text: 'Subject-specific content', color: 'text-blue-400' },
                  { icon: User, text: 'Enhanced profile visibility', color: 'text-purple-400' }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <benefit.icon className={`h-4 w-4 mr-3 ${benefit.color}`} />
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/profile/edit">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                  onClick={onComplete}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Complete Profile Now
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-gray-300 hover:bg-slate-800"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                This will only take 2-3 minutes to complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
