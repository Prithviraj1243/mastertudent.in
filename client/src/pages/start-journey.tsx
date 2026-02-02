import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  Upload, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Award,
  BookOpen
} from "lucide-react";

export default function StartJourney() {
  const [, setLocation] = useLocation();

  // No auth check needed - user just came from auth callback

  const handleGetStarted = () => {
    // Mark onboarding as complete
    const authUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
    authUser.onboardingCompleted = true;
    sessionStorage.setItem('authUser', JSON.stringify(authUser));
    
    // Redirect to home page
    setLocation('/');
  };

  const features = [
    {
      icon: BookOpen,
      title: "Access Premium Notes",
      description: "Download high-quality study materials from top performers",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Upload,
      title: "Upload & Earn",
      description: "Share your notes and earn coins for every download",
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with thousands of students and toppers",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: Award,
      title: "Become a Topper",
      description: "Verify your achievements and get recognized",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    }
  ];

  const benefits = [
    "Access to 1000+ verified study notes",
    "Earn coins by contributing materials",
    "Interactive community forum",
    "Personalized recommendations",
    "Track your learning progress",
    "Connect with top students"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <CheckCircle className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Welcome to MasterStudent! 🎉</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master Your Studies with
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Top Student Notes
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Access premium study notes from top performers, upload your own materials to earn, 
            and join a vibrant community of academic excellence.
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg group"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-slate-600 transition-all">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-2xl font-bold">What You'll Get</h3>
                <p className="text-slate-400">Everything you need to excel in your studies</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700 text-center">
              <Button
                onClick={handleGetStarted}
                variant="outline"
                size="lg"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Let's Get Started!
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Join thousands of students already mastering their studies 🎓
          </p>
        </div>
      </div>
    </div>
  );
}
