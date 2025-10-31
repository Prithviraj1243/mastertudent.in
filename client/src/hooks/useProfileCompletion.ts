import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useProfileCompletion() {
  const { user } = useAuth();
  const [shouldShowPopup, setShouldShowPopup] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      const percentage = calculateProfileCompletion(user);
      setCompletionPercentage(percentage);
      
      // Show popup if profile is less than 80% complete and user hasn't dismissed it recently
      const lastDismissed = localStorage.getItem('profilePopupDismissed');
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (percentage < 80 && (!lastDismissed || parseInt(lastDismissed) < oneDayAgo)) {
        // Show popup after a short delay to avoid jarring experience
        setTimeout(() => {
          setShouldShowPopup(true);
        }, 2000);
      }
    }
  }, [user]);

  const calculateProfileCompletion = (userData: any) => {
    const requiredFields = [
      userData?.firstName,
      userData?.lastName,
      userData?.email,
      userData?.phone,
      userData?.dateOfBirth,
      userData?.address,
      userData?.city,
      userData?.state,
      userData?.education,
      userData?.institution,
      userData?.bio,
      userData?.interests
    ];

    const completedFields = requiredFields.filter(field => 
      field && field.toString().trim() !== ''
    );

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const dismissPopup = () => {
    setShouldShowPopup(false);
    localStorage.setItem('profilePopupDismissed', Date.now().toString());
  };

  const completeProfile = () => {
    setShouldShowPopup(false);
    // Navigation to profile edit page will be handled by the component
  };

  return {
    shouldShowPopup,
    completionPercentage,
    dismissPopup,
    completeProfile
  };
}
