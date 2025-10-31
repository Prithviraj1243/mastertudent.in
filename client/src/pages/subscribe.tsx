import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { CheckCircle, Crown, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import PaymentGateway from "@/components/payment-gateway";


export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedPlan = urlParams.get('plan');
  const returnTo = urlParams.get('returnTo') || '/download-notes';
  
  // Set pre-selected plan on component mount
  useEffect(() => {
    if (preSelectedPlan && !selectedPlan) {
      setSelectedPlan(preSelectedPlan);
    }
  }, [preSelectedPlan, selectedPlan]);

  const handleProceedToPayment = (plan: string) => {
    setSelectedPlan(plan);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = () => {
    setLocation('/payment-success');
  };

  const handleBackFromPayment = () => {
    setShowPaymentGateway(false);
  };

  if (showPaymentGateway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
        <Header />
        <PaymentGateway 
          plan={selectedPlan as 'monthly' | 'yearly'}
          onBack={handleBackFromPayment}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  if (true) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation(returnTo)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-upgrade-title">
              Upgrade to Premium
            </h1>
            <p className="text-muted-foreground" data-testid="text-upgrade-description">
              Access unlimited downloads and premium content
            </p>
            {preSelectedPlan && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Continue with your selected {preSelectedPlan} plan
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPlan === 'monthly' ? 'border-primary border-2 shadow-lg' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
              data-testid="card-monthly-plan"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly Plan
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">₹59</span>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Perfect for short-term needs</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited note downloads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Access to all subjects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Follow toppers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg relative ${
                selectedPlan === 'yearly' ? 'border-primary border-2 shadow-lg' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan('yearly')}
              data-testid="card-yearly-plan"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Yearly Plan
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">₹499</span>
                    <p className="text-sm text-muted-foreground">/year</p>
                    <p className="text-xs text-green-600">Save ₹209</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Save 30% with annual billing</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Everything in Monthly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Early access to features</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => handleProceedToPayment(selectedPlan)}
              disabled={!selectedPlan}
              data-testid="button-proceed-payment"
              className={`px-8 py-3 font-semibold transition-all duration-200 ${
                selectedPlan 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105' 
                  : ''
              }`}
            >
              {!selectedPlan 
                ? "Select a Plan" 
                : `Proceed to Payment`
              }
            </Button>
            {selectedPlan && (
              <p className="text-xs text-gray-500 mt-2">
                Secure payment • Cancel anytime • Instant access
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // This return should never be reached due to the condition above
  return null;
}
