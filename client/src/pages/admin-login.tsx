import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, User, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store ONLY admin session data (completely separate from main website auth)
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.admin));

        toast({
          title: "Welcome Admin! 👑",
          description: "Login successful",
        });

        // Force a full page reload to update the App component's admin auth check
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Network Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">Secure Administrator Access</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-400" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4 text-red-400" />
                  Admin Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400" />
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Login as Admin
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                🔒 This is a secure admin area. Unauthorized access is prohibited.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => setLocation("/")}
            className="text-slate-400 hover:text-white"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
