import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  BookOpen, 
  Trophy, 
  Building2, 
  GraduationCap,
  ArrowRight,
  Users,
  Target
} from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Main category types based on user requirements
const mainCategories = [
  {
    id: "school",
    title: "Classes 9th–12th",
    description: "CBSE, ICSE, State Board notes for secondary and higher secondary education",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200 hover:border-blue-300",
    textColor: "text-blue-700",
    count: "2,500+ notes",
    popular: "Most Popular",
    features: ["CBSE & ICSE", "All Subjects", "Board Exam Prep"]
  },
  {
    id: "competitive_exam",
    title: "Entrance Exams",
    description: "JEE, NEET, CUET and other competitive examination materials",
    icon: Trophy,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200 hover:border-orange-300", 
    textColor: "text-orange-700",
    count: "1,800+ notes",
    popular: "High Success Rate",
    features: ["JEE & NEET", "CUET & CAT", "Expert Tips"]
  },
  {
    id: "professional_exam", 
    title: "Government Exams",
    description: "UPSC, SSC, Banking, Railway and other government job preparations",
    icon: Building2,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200 hover:border-green-300",
    textColor: "text-green-700",
    count: "1,200+ notes",
    popular: "Career Focused",
    features: ["UPSC & SSC", "Banking Exams", "Current Affairs"]
  },
  {
    id: "college",
    title: "College Exams", 
    description: "Engineering, Medical, MBA and other college-level study materials",
    icon: GraduationCap,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200 hover:border-purple-300",
    textColor: "text-purple-700",
    count: "900+ notes",
    popular: "Professional Growth",
    features: ["Engineering", "Medical", "MBA & More"]
  }
];

export default function CategorySelection() {
  const [, setLocation] = useLocation();

  const handleCategorySelect = (categoryType: string) => {
    // Navigate to exam selection page with selected category
    setLocation(`/exam-selection?category=${categoryType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6" role="main">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-purple-400/30">
                <Target className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-bounce">
                  🎯
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Choose Your Study Path 📚
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-2">
              Select the educational category that matches your current goals. 
              Get access to high-quality notes from top performers in your field.
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">5,000+ Active Students</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">6,400+ Study Materials</span>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mainCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`${category.bgColor} ${category.borderColor} border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden`}
                  onClick={() => handleCategorySelect(category.id)}
                  data-testid={`category-${category.id}`}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                    <IconComponent className="w-full h-full" />
                  </div>
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-sm">
                        {category.popular}
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <h3 className={`text-2xl font-bold ${category.textColor} mb-3 group-hover:scale-105 transition-transform`}>
                        {category.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 gap-2">
                        {category.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-gray-600">
                            <div className={`w-2 h-2 bg-gradient-to-r ${category.color} rounded-full`}></div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className={`w-full bg-gradient-to-r ${category.color} text-white hover:shadow-lg transition-all duration-200 group-hover:scale-105 font-semibold py-3`}
                      data-testid={`button-select-${category.id}`}
                    >
                      <span>Explore {category.title}</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Info Section */}
          <div className="text-center mt-16 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Why Choose <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>? 🌟
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Top Performers</h4>
                  <p className="text-sm">Notes from students who scored 90%+ marks</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Quality Assured</h4>
                  <p className="text-sm">All content reviewed by subject experts</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Proven Results</h4>
                  <p className="text-sm">95% of users improved their grades within 3 months</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}