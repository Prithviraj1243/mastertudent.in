import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Download, Upload, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "topper" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle Google OAuth with Supabase
  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast({
        title: "Please Select Purpose",
        description: "Choose whether you want to download or upload notes before signing in with Google",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Starting Supabase Google OAuth flow...');
      console.log('📍 Current origin:', window.location.origin);
      console.log('🔄 Redirect URL:', `${window.location.origin}/auth/callback`);

      // Store selected role in localStorage to retrieve after redirect
      localStorage.setItem('pendingUserRole', selectedRole);
      console.log('💾 Stored role in localStorage:', selectedRole);

      // Sign in with Google using Supabase Auth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('📦 OAuth response data:', data);
      console.log('❌ OAuth response error:', error);

      if (error) {
        console.error('❌ OAuth Error:', error);
        setIsLoading(false);
        throw error;
      }

      // If we reach here, redirect should happen automatically
      // Don't reset loading state - we're redirecting
      console.log('✅ OAuth initiated, waiting for redirect...');
      
      // Note: Don't call setIsLoading(false) here - we're redirecting!

    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      setIsLoading(false);
      toast({
        title: "Sign-In Failed",
        description: error.message || "Failed to sign in with Google. Please check your Supabase configuration.",
        variant: "destructive",
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Please Select Purpose",
        description: "Choose whether you want to download or upload notes",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password: password,
          role: selectedRole 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate auth cache to trigger re-fetch and proper routing
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Refetch user data and let App.tsx handle routing
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        
        // Give a moment for the cache to update, then navigate
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            setLocation("/");
          }
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to MasterStudent</CardTitle>
        <CardDescription>
          Enter your email address to sign in or create an account
        </CardDescription>
      </CardHeader>
      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Choose Your Purpose</Label>
            <div className="grid gap-3">
              <Button
                type="button"
                variant={selectedRole === "student" ? "default" : "outline"}
                onClick={() => setSelectedRole("student")}
                className={`h-auto p-4 justify-start text-left ${
                  selectedRole === "student" 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" 
                    : "hover:bg-blue-50"
                }`}
                data-testid="button-role-student"
              >
                <Download className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">For Downloading Notes</div>
                  <div className="text-sm opacity-90">Access premium study materials from top students</div>
                </div>
              </Button>
              
              <Button
                type="button"
                variant={selectedRole === "topper" ? "default" : "outline"}
                onClick={() => setSelectedRole("topper")}
                className={`h-auto p-4 justify-start text-left ${
                  selectedRole === "topper" 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" 
                    : "hover:bg-emerald-50"
                }`}
                data-testid="button-role-topper"
              >
                <Upload className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">For Uploading Notes</div>
                  <div className="text-sm opacity-90">Share your notes and earn coins for each download</div>
                </div>
              </Button>

            </div>
          </div>

          {/* Google Sign-In Button */}
          {selectedRole && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Quick Sign-In</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={!selectedRole || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="mr-2 h-4 w-4"
                  />
                )}
                Continue with Google
              </Button>
              
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                data-testid="input-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading || !selectedRole}
            data-testid="button-login"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}