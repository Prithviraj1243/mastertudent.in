import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Download, Upload, Lock } from "lucide-react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { handleGoogleOAuthForDeployedSite } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

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

  // Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!selectedRole) {
      toast({
        title: "Please Select Purpose",
        description: "Choose whether you want to download or upload notes before signing in with Google",
        variant: "destructive",
      });
      return;
    }

    if (!credentialResponse.credential) {
      toast({
        title: "Google Sign-In Error",
        description: "No credential received from Google",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔥 Processing Google OAuth login...');
      
      // Use Firebase-based Google OAuth (works on deployed website)
      const result = await handleGoogleOAuthForDeployedSite(credentialResponse.credential, selectedRole);
      
      if (result.success && result.user) {
        console.log('✅ Google OAuth login successful:', result.user);
        
        // Clear any existing data
        queryClient.clear();
        
        // Set authentication flags
        sessionStorage.setItem('directAuth', 'true');
        sessionStorage.setItem('userEmail', result.user.email);
        sessionStorage.setItem('userName', `${result.user.firstName} ${result.user.lastName}`);
        sessionStorage.setItem('authUser', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          name: result.user.name,
          picture: result.user.picture,
          role: result.user.role,
          provider: 'google',
          onboardingCompleted: true
        }));
        
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${result.user.firstName} ${result.user.lastName}`,
        });
        
        console.log('✅ User data saved to Firebase and will appear in admin panel!');
        
        // Redirect based on role
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            setLocation('/');
          }
        }, 1000);
      } else {
        throw new Error(result.error || 'Google OAuth failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

  // Handle Google OAuth Error
  const handleGoogleError = () => {
    toast({
      title: "Google Sign-In Error",
      description: "Failed to sign in with Google. Please try again.",
      variant: "destructive",
    });
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
              
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
              
              
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