import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowRight,
  Search,
  BookOpen,
  Trophy,
  Building2,
  GraduationCap,
  Star
} from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Category icons mapping
const categoryIcons = {
  school: BookOpen,
  competitive_exam: Trophy,
  professional_exam: Building2,
  college: GraduationCap
};

// Category titles mapping
const categoryTitles = {
  school: "Classes 9th–12th",
  competitive_exam: "Entrance Exams", 
  professional_exam: "Government Exams",
  college: "College Exams"
};

export default function ExamSelection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categoryType = urlParams.get('category') || 'school';

  // Fetch educational categories for selected category type
  const { data: categories, isLoading } = useQuery<any[]>({
    queryKey: ['/api/educational-categories', categoryType],
    queryFn: async () => {
      const response = await fetch(`/api/educational-categories?categoryType=${categoryType}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Filter categories based on search term
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExamSelect = (categoryId: string) => {
    setSelectedExam(categoryId);
  };

  const handleNext = () => {
    if (selectedExam) {
      // Navigate to catalog with selected exam category
      setLocation(`/catalog?categoryId=${selectedExam}`);
    }
  };

  const handleBack = () => {
    setLocation('/categories');
  };

  const IconComponent = categoryIcons[categoryType as keyof typeof categoryIcons] || BookOpen;
  const categoryTitle = categoryTitles[categoryType as keyof typeof categoryTitles] || "Select Exam";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading exam options...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6" role="main">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
              data-testid="button-back-categories"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
            
            {selectedExam && (
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-200 font-semibold px-6"
                data-testid="button-next-subjects"
              >
                Next: View Notes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-purple-400/30">
                <IconComponent className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {categoryTitle}
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-6">
              Select your specific exam or class to access targeted study materials from top performers.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for specific exam or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-lg border-2 bg-white hover:border-purple-300 focus:border-purple-400 transition-colors shadow-sm"
                data-testid="input-search-exams"
              />
            </div>
          </div>

          {/* Selection Summary */}
          {selectedExam && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-purple-50 border-purple-200 border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-800">Selected:</h3>
                        <p className="text-purple-600">
                          {categories?.find(cat => cat.id === selectedExam)?.name}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      ✓ Ready to Proceed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Exam/Class Cards */}
          <div className="max-w-6xl mx-auto">
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 ${
                      selectedExam === category.id
                        ? 'border-purple-400 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                    onClick={() => handleExamSelect(category.id)}
                    data-testid={`exam-card-${category.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-2 ${
                            selectedExam === category.id ? 'text-purple-700' : 'text-gray-800'
                          }`}>
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {category.icon && (
                          <div className="text-2xl ml-3">{category.icon}</div>
                        )}
                      </div>

                      {/* Category Details */}
                      <div className="space-y-2 mb-4">
                        {category.subjects && category.subjects.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            <span>{category.subjects.length} Subjects Available</span>
                          </div>
                        )}
                        {category.classLevel && (
                          <Badge variant="secondary" className="text-xs">
                            Class {category.classLevel}
                          </Badge>
                        )}
                        {category.board && (
                          <Badge variant="outline" className="text-xs">
                            {category.board}
                          </Badge>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className={`flex items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                        selectedExam === category.id
                          ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
                      }`}>
                        {selectedExam === category.id ? (
                          <>
                            <Star className="h-4 w-4 mr-2 fill-current" />
                            Selected
                          </>
                        ) : (
                          <>
                            Click to Select
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No matching exams found' : 'No exams available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Exam options for this category will be available soon'
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          {selectedExam && filteredCategories.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transition-all duration-200 font-semibold px-8 py-4 text-lg"
                data-testid="button-proceed-to-notes"
              >
                Proceed to Study Materials
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}