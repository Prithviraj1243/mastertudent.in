import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Star,
  Zap,
  Sparkles,
  Globe,
  Coins,
  Gem,
  Hexagon,
  Triangle,
  Gift
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PaymentGatewayProps {
  plan: 'monthly' | 'yearly';
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'card' | 'upi' | 'wallet';

export default function PaymentGateway({ plan, onBack, onSuccess }: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    // UPI details
    upiId: '',
    selectedUpiApp: 'gpay',
    // Wallet selection
    walletType: 'paytm',
    // Discount code
    discountCode: '',
    // Contact details
    email: '',
    phone: ''
  });
  
  const { toast } = useToast();

  const planDetails = {
    monthly: { price: 59, period: 'month', savings: 0 },
    yearly: { price: 499, period: 'year', savings: 209 }
  };

  const currentPlan = planDetails[plan];
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  // Discount codes
  const discountCodes = {
    'STUDENT20': { type: 'percentage' as const, value: 20, description: '20% off for students' },
    'FIRST50': { type: 'fixed' as const, value: 50, description: '₹50 off on first purchase' },
    'WELCOME10': { type: 'percentage' as const, value: 10, description: '10% welcome discount' },
    'SAVE100': { type: 'fixed' as const, value: 100, description: '₹100 off on yearly plan' }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyDiscount = () => {
    const code = formData.discountCode.toUpperCase();
    if (discountCodes[code as keyof typeof discountCodes]) {
      const discountInfo = discountCodes[code as keyof typeof discountCodes];
      setDiscount(discountInfo.value);
      setDiscountType(discountInfo.type);
      toast({
        title: "Discount Applied! 🎉",
        description: discountInfo.description,
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid discount code.",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    let subtotal = currentPlan.price;
    let discountAmount = 0;
    
    if (discount > 0) {
      if (discountType === 'percentage') {
        discountAmount = (subtotal * discount) / 100;
      } else {
        discountAmount = discount;
      }
    }
    
    const discountedPrice = subtotal - discountAmount;
    const gstAmount = Math.round(discountedPrice * 0.18);
    const total = discountedPrice + gstAmount;
    
    return {
      subtotal,
      discountAmount,
      discountedPrice,
      gstAmount,
      total: Math.round(total)
    };
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
    {
      id: 'upi' as PaymentMethod,
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using any UPI app',
      popular: true,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Card',
      icon: CreditCard,
      description: 'Credit/Debit cards',
      popular: false,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'wallet' as PaymentMethod,
      name: 'Wallet',
      icon: Wallet,
      description: 'Digital wallets',
      popular: false,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  // UPI Apps with real brand colors
  const upiApps = [
    { 
      id: 'gpay', 
      name: 'Google Pay', 
      color: 'from-blue-600 to-green-500', 
      logo: 'https://developers.google.com/pay/api/images/brand-guidelines/google-pay-mark.png',
      bgColor: 'bg-white',
      popular: true 
    },
    { 
      id: 'phonepe', 
      name: 'PhonePe', 
      color: 'from-purple-600 to-purple-700', 
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjczQUI3Ii8+Cjwvc3ZnPgo=',
      bgColor: 'bg-purple-100',
      popular: true 
    },
    { 
      id: 'paytm', 
      name: 'Paytm', 
      color: 'from-blue-500 to-cyan-400', 
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwQkFGMiIvPgo8cGF0aCBkPSJNNyA4SDE3VjE2SDdWOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      bgColor: 'bg-blue-100',
      popular: true 
    },
    { 
      id: 'bhim', 
      name: 'BHIM', 
      color: 'from-orange-500 to-red-500', 
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0ZGNjcwMCIvPgo8dGV4dCB4PSIxMiIgeT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QkhJTTwvdGV4dD4KPC9zdmc+Cg==',
      bgColor: 'bg-orange-100',
      popular: false 
    }
  ];

  // Card Networks
  const cardNetworks = [
    { id: 'visa', name: 'Visa', color: 'from-blue-600 to-blue-700', icon: '💳' },
    { id: 'mastercard', name: 'Mastercard', color: 'from-red-500 to-orange-500', icon: '💳' },
    { id: 'rupay', name: 'RuPay', color: 'from-green-600 to-blue-600', icon: '🇮🇳' },
    { id: 'amex', name: 'American Express', color: 'from-gray-600 to-gray-700', icon: '💎' }
  ];

  // Digital Wallets - simplified
  const walletOptions = [
    { id: 'paytm', name: 'Paytm', color: 'from-blue-500 to-cyan-500', icon: '💳' },
    { id: 'phonepe', name: 'PhonePe', color: 'from-purple-500 to-purple-600', icon: '📱' },
    { id: 'amazonpay', name: 'Amazon Pay', color: 'from-orange-500 to-yellow-500', icon: '🛒' },
    { id: 'mobikwik', name: 'MobiKwik', color: 'from-red-500 to-pink-500', icon: '💰' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3">
            <div className="relative">
              <Shield className="h-6 w-6 text-green-400" />
              <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
            </div>
            <span className="text-white font-medium">Quantum Secured</span>
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Payment Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="relative">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
                  </div>
                  Choose Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
                        selectedMethod === method.id
                          ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-2xl'
                          : 'border-white/20 hover:border-white/40 bg-white/5'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      {method.popular && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                          🔥 Popular
                        </div>
                      )}
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.gradient} flex items-center justify-center mb-4 animate-pulse`}>
                          <method.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">{method.name}</h3>
                        <p className="text-sm text-white/70">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Forms */}
          <div className="space-y-6">
            {selectedMethod === 'upi' && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Select UPI App</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {upiApps.map((app) => (
                      <div
                        key={app.id}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                          formData.selectedUpiApp === app.id
                            ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-lg'
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                        }`}
                        onClick={() => handleInputChange('selectedUpiApp', app.id)}
                      >
                        {app.popular && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Popular
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${app.bgColor} flex items-center justify-center shadow-md`}>
                            {app.logo ? (
                              <img src={app.logo} alt={app.name} className="w-8 h-8" />
                            ) : (
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${app.color} flex items-center justify-center`}>
                                <span className="text-white font-bold text-xs">{app.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{app.name}</div>
                            <div className="text-xs text-white/70">UPI Payment</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="upiId" className="text-white">Enter UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-2"
                    />
                    <p className="text-xs text-white/60 mt-1">Enter your UPI ID to proceed with payment</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'card' && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {cardNetworks.map((network) => (
                      <div key={network.id} className={`rounded-lg p-2 bg-gradient-to-r ${network.color} flex items-center justify-center`}>
                        <span className="text-xs font-bold text-white">{network.name}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg tracking-wider"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-white">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        maxLength={5}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-white">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                        type="password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName" className="text-white">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === 'wallet' && (
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Select Digital Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {walletOptions.map((wallet) => (
                      <div
                        key={wallet.id}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                          formData.walletType === wallet.id
                            ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-lg'
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                        }`}
                        onClick={() => handleInputChange('walletType', wallet.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${wallet.color} flex items-center justify-center shadow-md`}>
                            <span className="text-2xl">{wallet.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">{wallet.name}</div>
                            <div className="text-xs text-white/70">Digital Wallet</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const totals = calculateTotal();
                return (
                  <>
                    <div className="flex justify-between text-lg">
                      <span>{plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan</span>
                      <span className="font-bold">₹{totals.subtotal}</span>
                    </div>
                    
                    {/* Discount Code Section */}
                    <div className="border border-white/20 rounded-lg p-3 bg-white/5">
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Discount code"
                          value={formData.discountCode}
                          onChange={(e) => handleInputChange('discountCode', e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                        />
                        <Button 
                          onClick={applyDiscount}
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 px-3"
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="text-xs text-white/60">
                        Try: STUDENT20, FIRST50, WELCOME10
                      </div>
                    </div>
                    
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({discountType === 'percentage' ? `${discount}%` : `₹${discount}`})</span>
                        <span>-₹{Math.round(totals.discountAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>₹{totals.gstAmount}</span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-xl border-t border-white/20 pt-4">
                      <span>Total</span>
                      <span className="text-cyan-400">₹{totals.total}</span>
                    </div>

                    <div className="space-y-2 pt-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Unlimited downloads</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>All subjects access</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Premium support</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/50 hover:shadow-2xl border border-green-400/30 hover:border-green-300/60"
                      style={{
                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
                        filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))'
                      }}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-6 w-6" />
                          Pay ₹{totals.total}
                        </div>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-white/50 mt-4">
                      <Shield className="h-3 w-3" />
                      <span>Secured by 256-bit SSL encryption</span>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
