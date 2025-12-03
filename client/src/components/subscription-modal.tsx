import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimplePaymentGateway from "@/components/simple-payment-gateway";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, 
  CheckCircle, 
  X, 
  Download,
  Clock,
  Zap,
  GraduationCap,
  Star,
  Shield
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: string) => void;
  onStartTrial: () => void;
  noteTitle: string;
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  onStartTrial,
  noteTitle 
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const handleSubscribe = () => {
    if (selectedPlan) {
      setShowPaymentGateway(true);
    }
  };

  const handlePaymentBack = () => {
    setShowPaymentGateway(false);
  };

  const handlePaymentSuccess = () => {
    onSubscribe(selectedPlan);
    onClose();
  };

  const handleStartTrial = () => {
    onStartTrial();
    onClose();
  };

  const scrollToPlans = () => {
    const plansSection = document.getElementById('premium-plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Additional scroll to ensure better visibility
      setTimeout(() => {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      }, 500);
    }
  };

  // Show payment gateway if selected
  if (showPaymentGateway && selectedPlan) {
    const planPrice = selectedPlan === 'yearly' ? 499 : 59;
    const planName = selectedPlan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium';
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white p-0 m-0 relative border-0 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DodoPaymentGateway 
            noteId={`subscription-${selectedPlan}`}
            noteTitle={planName}
            notePrice={planPrice}
            onBack={handlePaymentBack}
            onSuccess={handlePaymentSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white p-0 m-0 relative border-0 rounded-2xl shadow-2xl"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                MasterStudent
              </span>
              <div className="text-xs text-orange-600 font-medium">
                Premium Access
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Intent */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-center mb-3">
              <Download className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Download</h3>
            <p className="text-gray-600">
              <span className="font-medium text-blue-600">"{noteTitle}"</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">Choose how you'd like to access this note</p>
          </div>

          {/* Free Trial Option */}
          <motion.div 
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Free Trial</h3>
                  <p className="text-green-600 font-medium">Try before you buy</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">FREE</div>
                <div className="text-sm text-gray-500">7 days</div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">3 free downloads</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Upgrade anytime</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStartTrial}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
            >
              Start Free Trial
            </Button>
          </motion.div>

          {/* Premium Plans */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Or choose a premium plan</h3>
              <p className="text-sm text-gray-500">Unlimited access to all notes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <motion.div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedPlan === 'monthly' 
                    ? 'border-purple-400 bg-purple-50 shadow-lg' 
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan('monthly')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="h-6 w-6 text-purple-500 mr-2" />
                    <h4 className="text-lg font-bold text-gray-800">Monthly</h4>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">₹59</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Unlimited downloads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">All subjects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Premium support</span>
                  </div>
                </div>
              </motion.div>

              {/* Yearly Plan */}
              <motion.div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative ${
                  selectedPlan === 'yearly' 
                    ? 'border-orange-400 bg-orange-50 shadow-lg' 
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan('yearly')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  SAVE 30%
                </div>
                
                <div className="text-center mb-4 pt-2">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-orange-500 mr-2" />
                    <h4 className="text-lg font-bold text-gray-800">Yearly</h4>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">₹499</div>
                  <div className="text-sm text-gray-500">per year</div>
                  <div className="text-xs text-green-600 font-medium">Save ₹209</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Everything in Monthly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Early access</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="text-center">
            {selectedPlan ? (
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Shield className="h-5 w-5 mr-2" />
                Continue to Payment - ₹{selectedPlan === 'yearly' ? '499' : '59'}
              </Button>
            ) : (
              <p className="text-gray-500 text-sm">Select a plan above to continue</p>
            )}
            
            {selectedPlan && (
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-center space-x-4">
                <span>🔒 Secure payment</span>
                <span>❌ Cancel anytime</span>
                <span>⚡ Instant access</span>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
