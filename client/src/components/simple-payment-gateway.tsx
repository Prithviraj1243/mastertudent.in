import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  Wallet,
  GraduationCap,
  Lock,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SimplePaymentGatewayProps {
  plan: 'monthly' | 'yearly';
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'wallet';

export default function SimplePaymentGateway({ plan, onBack, onSuccess }: SimplePaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    walletType: 'paytm'
  });
  
  const { toast } = useToast();

  const planDetails = {
    monthly: { price: 59, period: 'month' },
    yearly: { price: 499, period: 'year' }
  };

  const currentPlan = planDetails[plan];
  const gstAmount = Math.round(currentPlan.price * 0.18);
  const total = currentPlan.price + gstAmount;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Welcome to MasterStudent Premium! Your ${plan} subscription is now active.`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'upi' as PaymentMethod, name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card' as PaymentMethod, name: 'Card', icon: CreditCard, description: 'Credit/Debit Card' },
    { id: 'wallet' as PaymentMethod, name: 'Wallet', icon: Wallet, description: 'Digital Wallets' }
  ];

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
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  Choose Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <method.icon className={`h-8 w-8 mx-auto mb-2 ${
                        selectedMethod === method.id ? 'text-orange-500' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-800">{method.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Payment Forms */}
                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@paytm"
                        value={formData.upiId}
                        onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">Enter your UPI ID to proceed</p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Select Wallet</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik'].map((wallet) => (
                          <div
                            key={wallet}
                            className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                              formData.walletType === wallet.toLowerCase().replace(' ', '')
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, walletType: wallet.toLowerCase().replace(' ', '') }))}
                          >
                            <span className="font-medium">{wallet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                    <span className="text-gray-600">{plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan</span>
                    <span className="font-semibold">₹{currentPlan.price}</span>
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

                <div className="space-y-2 pt-4 text-sm border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited downloads</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>All subjects access</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Premium support</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
