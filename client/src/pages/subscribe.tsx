import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { CheckCircle, Crown } from "lucide-react";

// Stripe is optional - only initialize if key is provided
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

const SubscribeForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to MasterStudent Premium!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="form-subscription">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={!stripe || !elements}
        data-testid="button-submit-payment"
      >
        Subscribe Now
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSubscription = async (plan: string) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { plan });
      const data = await response.json();
      if (response.status === 503) {
        toast({
          title: "Payment Unavailable",
          description: "Payment processing is currently not configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-upgrade-title">
              Upgrade to Premium
            </h1>
            <p className="text-muted-foreground" data-testid="text-upgrade-description">
              Access unlimited downloads and premium content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-colors ${
                selectedPlan === 'monthly' ? 'border-primary border-2' : ''
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
              className={`cursor-pointer transition-colors relative ${
                selectedPlan === 'yearly' ? 'border-primary border-2' : ''
              }`}
              onClick={() => setSelectedPlan('yearly')}
              data-testid="card-yearly-plan"
            >
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
              onClick={() => createSubscription(selectedPlan)}
              disabled={loading || !selectedPlan}
              data-testid="button-proceed-payment"
            >
              {loading 
                ? "Processing..." 
                : !selectedPlan 
                ? "Select a Plan" 
                : `Subscribe to ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm plan={selectedPlan} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
