import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Loader,
  AlertCircle,
  GraduationCap,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DodoPaymentGatewayProps {
  noteId: string;
  noteTitle: string;
  notePrice: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function DodoPaymentGateway({ 
  noteId, 
  noteTitle, 
  notePrice,
  onBack, 
  onSuccess 
}: DodoPaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const gstAmount = Math.round(notePrice * 0.18);
  const total = notePrice + gstAmount;

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get user data from localStorage or use defaults
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userPhone = localStorage.getItem('userPhone') || '9876543210';
      const userName = localStorage.getItem('userName') || 'User';
      
      // Generate unique order ID
      const orderId = `note-${noteId}-${Date.now()}`;
      
      // Determine which checkout link to use based on plan
      let baseCheckoutUrl = '';
      let planType = 'monthly';
      
      // Check if this is a yearly plan (price > 400)
      if (notePrice >= 400) {
        // Yearly plan
        baseCheckoutUrl = 'https://checkout.dodopayments.com/buy/pdt_1d9ZylIEicJcInaytXMne';
        planType = 'yearly';
      } else {
        // Monthly plan
        baseCheckoutUrl = 'https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng';
        planType = 'monthly';
      }
      
      // Build complete checkout URL with all parameters
      const checkoutParams = new URLSearchParams({
        quantity: '1',
        email: userEmail,
        phone: userPhone,
        fullName: userName,
        custom_order_id: orderId,
        custom_description: `Download: ${noteTitle} (${planType})`,
        custom_amount: total.toString(),
        custom_return_url: `${window.location.origin}/download-notes?payment=success`,
        custom_notify_url: `${window.location.origin}/api/dodo-webhook`
      });

      const dodoCheckoutUrl = `${baseCheckoutUrl}?${checkoutParams.toString()}`;
      
      console.log(`Redirecting to Dodo checkout (${planType}):`, dodoCheckoutUrl);
      
      // Redirect to Dodo checkout
      window.location.href = dodoCheckoutUrl;

      toast({
        title: "Redirecting to Dodo",
        description: `Opening Dodo Payments checkout for ${planType} plan...`,
        variant: "default"
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
      toast({
        title: "Payment Error",
        description: err.message || 'Failed to initiate payment',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              disabled={isProcessing}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-orange-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                MasterStudent
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Download Note with Dodo Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Note Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Note Details</h3>
                  <p className="text-gray-700"><strong>Title:</strong> {noteTitle}</p>
                  <p className="text-gray-700 mt-1"><strong>Price:</strong> ₹{notePrice}</p>
                </div>

                {/* Payment Method Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Secure Payment
                  </h3>
                  <p className="text-gray-700 text-sm">
                    You'll be redirected to Dodo Payments secure gateway to complete your payment. 
                    Your payment information is encrypted and secure.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Payment Error</h4>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-semibold text-gray-800">What you get:</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instant access to the note</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Download in multiple formats</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Note Price</span>
                    <span className="font-semibold">₹{notePrice}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg border-t pt-3">
                    <span>Total</span>
                    <span className="text-orange-600">₹{total}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Pay ₹{total}
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-3">
                  <Shield className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>

                <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t">
                  <p>Powered by Dodo Payments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
