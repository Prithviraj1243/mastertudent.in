import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  Shield, 
  GraduationCap, 
  Lock, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TeacherAuthProps {
  onAuthenticated: (teacherData: any) => void;
}

export default function TeacherAuth({ onAuthenticated }: TeacherAuthProps) {
  const [credentials, setCredentials] = useState({
    teacherId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock teacher credentials - In production, this would be from a secure database
  const teacherCredentials = {
    'TEACH001': { 
      password: 'MasterTeach@2024', 
      name: 'Dr. Priya Sharma', 
      subject: 'Mathematics',
      department: 'Science',
      permissions: ['approve_notes', 'reject_notes', 'view_analytics']
    },
    'TEACH002': { 
      password: 'Physics@123', 
      name: 'Prof. Rajesh Kumar', 
      subject: 'Physics',
      department: 'Science',
      permissions: ['approve_notes', 'reject_notes', 'view_analytics']
    },
    'TEACH003': { 
      password: 'Chemistry@456', 
      name: 'Dr. Anita Verma', 
      subject: 'Chemistry',
      department: 'Science',
      permissions: ['approve_notes', 'reject_notes', 'view_analytics']
    },
    'ADMIN001': { 
      password: 'Admin@Master2024', 
      name: 'System Administrator', 
      subject: 'All Subjects',
      department: 'Administration',
      permissions: ['approve_notes', 'reject_notes', 'view_analytics', 'manage_users', 'system_settings']
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const teacher = teacherCredentials[credentials.teacherId as keyof typeof teacherCredentials];
      
      if (teacher && teacher.password === credentials.password) {
        const teacherData = {
          id: credentials.teacherId,
          name: teacher.name,
          subject: teacher.subject,
          department: teacher.department,
          permissions: teacher.permissions,
          loginTime: new Date().toISOString()
        };
        
        // Store in localStorage for session persistence
        localStorage.setItem('teacherAuth', JSON.stringify(teacherData));
        
        toast({
          title: "Authentication Successful! 🎉",
          description: `Welcome back, ${teacher.name}`,
        });
        
        onAuthenticated(teacherData);
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid Teacher ID or Password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 3 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 3 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-xl">
                <GraduationCap className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Teacher Portal
            </CardTitle>
            <p className="text-gray-300">
              MasterStudent Admin Dashboard
            </p>
            <div className="flex items-center justify-center mt-3 text-sm text-orange-300">
              <Shield className="w-4 h-4 mr-1" />
              Secure Authentication Required
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="teacherId" className="text-white font-medium">
                  Teacher ID
                </Label>
                <Input
                  id="teacherId"
                  type="text"
                  placeholder="Enter your Teacher ID"
                  value={credentials.teacherId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, teacherId: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400 focus:ring-orange-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || !credentials.teacherId || !credentials.password}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Demo Credentials:</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <p><strong>Teacher ID:</strong> TEACH001</p>
                <p><strong>Password:</strong> MasterTeach@2024</p>
                <p className="text-orange-300 mt-2">Or use ADMIN001 / Admin@Master2024 for full access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
