import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, X } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAction?: string; // e.g., "download", "follow", "feedback"
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  triggerAction = "access premium features" 
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₹59",
      period: "/month",
      description: "Perfect for short-term needs",
      features: [
        "Unlimited note downloads",
        "Access to all subjects",
        "Follow toppers",
        "Rate and review notes"
      ],
      savings: null
    },
    {
      id: "yearly",
      name: "Yearly Plan", 
      price: "₹499",
      period: "/year",
      description: "Save 30% with annual billing",
      features: [
        "Everything in Monthly",
        "Priority support",
        "Early access to features",
        "Special topper perks"
      ],
      savings: "Save ₹209"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0" data-testid="subscription-modal">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <DialogHeader className="text-center pt-8 pb-6 px-8">
            <div className="flex justify-center mb-4">
              <Crown className="h-16 w-16 text-secondary" />
            </div>
            <DialogTitle className="text-3xl font-bold text-foreground mb-2" data-testid="text-modal-title">
              Upgrade to Premium
            </DialogTitle>
            <p className="text-muted-foreground text-lg" data-testid="text-modal-description">
              To {triggerAction}, you need an active subscription
            </p>
          </DialogHeader>

          {/* Plans */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-200 relative ${
                    selectedPlan === plan.id 
                      ? 'border-primary border-2 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  } ${plan.id === 'yearly' ? 'ring-2 ring-primary ring-opacity-20' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  data-testid={`plan-card-${plan.id}`}
                >
                  {/* Best Value Badge */}
                  {plan.id === 'yearly' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full">
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="text-center">
                      {/* Plan Header */}
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-3xl font-bold text-foreground">
                            {plan.price}
                          </span>
                          <span className="text-lg text-muted-foreground">
                            {plan.period}
                          </span>
                        </div>
                        {plan.savings && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            {plan.savings}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-foreground text-left">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPlan === plan.id 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedPlan === plan.id && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={onClose}
                className="px-8"
                data-testid="button-cancel-subscription"
              >
                Maybe Later
              </Button>
              <Link href="/subscribe">
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={onClose}
                  data-testid="button-proceed-subscription"
                >
                  Subscribe to {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Cancel anytime. No hidden fees. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
