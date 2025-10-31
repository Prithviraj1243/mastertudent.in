import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { EducationalCategory, UserEducationalPreference } from "@shared/schema";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('school');


  // Fetch all educational categories
  const { data: categories, isLoading } = useQuery<EducationalCategory[]>({
    queryKey: ['/api/educational-categories'],
  });

  // Complete onboarding mutation
  const completeOnboarding = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      return apiRequest('POST', '/api/complete-onboarding', { categoryIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleComplete = () => {
    if (selectedCategories.length > 0) {
      completeOnboarding.mutate(selectedCategories);
    }
  };

  const handleSkip = () => {
    // Complete onboarding with no categories to mark it as completed
    completeOnboarding.mutate([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Use fallback categories if backend returns empty
  let finalCategories = categories;
  if (!categories || categories.length === 0) {
    finalCategories = [
      // School Categories
      {
        id: "frontend-1",
        name: "Class 9th CBSE",
        description: "Class 9 CBSE Board",
        categoryType: "school",
        classLevel: "9",
        board: "CBSE",
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 10,
        icon: "📔",
        color: "#3B82F6",
        createdAt: null
      },
      {
        id: "frontend-2", 
        name: "Class 10th CBSE",
        description: "Class 10 CBSE Board with Board Exams",
        categoryType: "school",
        classLevel: "10",
        board: "CBSE",
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 13,
        icon: "📕",
        color: "#3B82F6",
        createdAt: null
      },
      {
        id: "frontend-3",
        name: "Class 11th CBSE Science",
        description: "Class 11 CBSE Science Stream (PCM/PCB)",
        categoryType: "school",
        classLevel: "11", 
        board: "CBSE",
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 16,
        icon: "🔬",
        color: "#F59E0B",
        createdAt: null
      },
      {
        id: "frontend-4",
        name: "Class 12th CBSE Science", 
        description: "Class 12 CBSE Science Stream (PCM/PCB)",
        categoryType: "school",
        classLevel: "12",
        board: "CBSE", 
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 20,
        icon: "🎓",
        color: "#F59E0B",
        createdAt: null
      },
      {
        id: "frontend-7",
        name: "Class 11th CBSE Commerce",
        description: "Class 11 CBSE Commerce Stream",
        categoryType: "school",
        classLevel: "11",
        board: "CBSE",
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 17,
        icon: "💼",
        color: "#F59E0B",
        createdAt: null
      },
      {
        id: "frontend-8",
        name: "Class 12th CBSE Commerce",
        description: "Class 12 CBSE Commerce Stream", 
        categoryType: "school",
        classLevel: "12",
        board: "CBSE",
        examType: null,
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 21,
        icon: "📈",
        color: "#F59E0B",
        createdAt: null
      },
      // Competitive Exam Categories - Entrance Exams
      {
        id: "frontend-5",
        name: "JEE Main",
        description: "Joint Entrance Examination - Main",
        categoryType: "competitive_exam",
        classLevel: null,
        board: null,
        examType: "JEE_Main",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 30,
        icon: "⚙️",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-11",
        name: "JEE Advanced",
        description: "Joint Entrance Examination - Advanced",
        categoryType: "competitive_exam",
        classLevel: null,
        board: null,
        examType: "JEE_Advanced",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 31,
        icon: "🎯",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-6",
        name: "NEET UG",
        description: "National Eligibility cum Entrance Test - Undergraduate", 
        categoryType: "competitive_exam",
        classLevel: null,
        board: null,
        examType: "NEET_UG",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 32,
        icon: "🩺",
        color: "#7C3AED",
        createdAt: null
      },
      {
        id: "frontend-12",
        name: "CUET UG",
        description: "Common University Entrance Test - Undergraduate",
        categoryType: "competitive_exam",
        classLevel: null,
        board: null,
        examType: "CUET_UG",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 33,
        icon: "🎓",
        color: "#7C3AED",
        createdAt: null
      },
      {
        id: "frontend-13",
        name: "CUET PG",
        description: "Common University Entrance Test - Postgraduate",
        categoryType: "competitive_exam",
        classLevel: null,
        board: null,
        examType: "CUET_PG",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 34,
        icon: "📚",
        color: "#7C3AED",
        createdAt: null
      },
      // Professional Exam Categories - Government & Banking
      {
        id: "frontend-9",
        name: "UPSC CSE",
        description: "Union Public Service Commission - Civil Services Examination",
        categoryType: "professional_exam",
        classLevel: null,
        board: null,
        examType: "UPSC_CSE",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 40,
        icon: "🏛️",
        color: "#DC2626",
        createdAt: null
      },
      {
        id: "frontend-10",
        name: "SSC CGL",
        description: "Staff Selection Commission - Combined Graduate Level",
        categoryType: "professional_exam", 
        classLevel: null,
        board: null,
        examType: "SSC_CGL",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 35,
        icon: "📝",
        color: "#7C2D12",
        createdAt: null
      },
      {
        id: "frontend-14",
        name: "SSC CHSL",
        description: "Staff Selection Commission - Combined Higher Secondary Level",
        categoryType: "professional_exam",
        classLevel: null,
        board: null,
        examType: "SSC_CHSL",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 36,
        icon: "📊",
        color: "#7C2D12",
        createdAt: null
      },
      {
        id: "frontend-15",
        name: "SBI PO",
        description: "State Bank of India - Probationary Officer",
        categoryType: "professional_exam",
        classLevel: null,
        board: null,
        examType: "SBI_PO",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 45,
        icon: "🏦",
        color: "#1E40AF",
        createdAt: null
      },
      {
        id: "frontend-16",
        name: "IBPS PO",
        description: "Institute of Banking Personnel Selection - Probationary Officer",
        categoryType: "professional_exam",
        classLevel: null,
        board: null,
        examType: "IBPS_PO",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 46,
        icon: "💳",
        color: "#1E40AF",
        createdAt: null
      },
      {
        id: "frontend-17",
        name: "RBI Grade B",
        description: "Reserve Bank of India - Grade B Officer",
        categoryType: "professional_exam",
        classLevel: null,
        board: null,
        examType: "RBI_Grade_B",
        engineeringBranch: null,
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 47,
        icon: "🏛️",
        color: "#1E40AF",
        createdAt: null
      },
      // College Categories - Engineering & Medical
      {
        id: "frontend-18",
        name: "Computer Science Engineering",
        description: "Computer Science and Engineering Branch",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: "Computer_Science",
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 50,
        icon: "💻",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-19",
        name: "Electronics & Communication Engineering",
        description: "Electronics and Communication Engineering Branch",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: "Electronics_Communication",
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 51,
        icon: "📡",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-20",
        name: "Mechanical Engineering",
        description: "Mechanical Engineering Branch",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: "Mechanical",
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 52,
        icon: "⚙️",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-21",
        name: "Civil Engineering",
        description: "Civil Engineering Branch",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: "Civil",
        medicalBranch: null,
        subjects: null,
        isActive: true,
        displayOrder: 53,
        icon: "🏗️",
        color: "#059669",
        createdAt: null
      },
      {
        id: "frontend-22",
        name: "MBBS General Medicine",
        description: "Bachelor of Medicine and Bachelor of Surgery - General Medicine",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: null,
        medicalBranch: "General_Medicine",
        subjects: null,
        isActive: true,
        displayOrder: 60,
        icon: "🩺",
        color: "#7C3AED",
        createdAt: null
      },
      {
        id: "frontend-23",
        name: "MBBS Surgery",
        description: "Bachelor of Medicine and Bachelor of Surgery - Surgery Specialization",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: null,
        medicalBranch: "Surgery",
        subjects: null,
        isActive: true,
        displayOrder: 61,
        icon: "🔬",
        color: "#7C3AED",
        createdAt: null
      },
      {
        id: "frontend-24",
        name: "MBBS Pediatrics",
        description: "Bachelor of Medicine and Bachelor of Surgery - Pediatrics Specialization",
        categoryType: "college",
        classLevel: null,
        board: null,
        examType: null,
        engineeringBranch: null,
        medicalBranch: "Pediatrics",
        subjects: null,
        isActive: true,
        displayOrder: 62,
        icon: "👶",
        color: "#7C3AED",
        createdAt: null
      }
    ] as EducationalCategory[];
  }

  const groupedCategories = finalCategories?.reduce((acc, category) => {
    const categoryType = (category as any).categoryType;
    if (!acc[categoryType]) {
      acc[categoryType] = [];
    }
    acc[categoryType].push(category);
    return acc;
  }, {} as Record<string, EducationalCategory[]>) || {};

  // Ensure we have data for each tab
  if (!groupedCategories.school) groupedCategories.school = [];
  if (!groupedCategories.competitive_exam) groupedCategories.competitive_exam = [];
  if (!groupedCategories.professional_exam) groupedCategories.professional_exam = [];
  if (!groupedCategories.college) groupedCategories.college = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="relative mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="absolute left-0 top-0 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
            data-testid="button-back-onboarding"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-pink-400/50">
              <div className="relative">
                <div className="text-4xl">📚</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg animate-bounce">
                  ⭐
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Welcome to <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">MasterStudent</span>! 🎓
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Let's personalize your learning experience! Select the educational segments that interest you most.
            You can always change these preferences later.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="w-16 h-1 bg-purple-200 rounded-full">
              <div className="w-full h-full bg-purple-500 rounded-full"></div>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Category Selection */}
        <Card className="max-w-6xl mx-auto p-6 shadow-xl border-2 border-purple-200/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="school" data-testid="tab-school">
                🏫 School (9th-12th)
              </TabsTrigger>
              <TabsTrigger value="competitive_exam" data-testid="tab-competitive">
                🎯 Entrance Exams
              </TabsTrigger>
              <TabsTrigger value="professional_exam" data-testid="tab-professional">
                🏛️ Govt & Banking
              </TabsTrigger>
              <TabsTrigger value="college" data-testid="tab-college">
                🎓 College Courses
              </TabsTrigger>
            </TabsList>

            {Object.entries(groupedCategories).map(([type, cats]) => (
              <TabsContent key={type} value={type} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cats.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <Card
                          key={category.id}
                          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isSelected 
                            ? 'border-2 border-purple-500 bg-purple-50 shadow-lg' 
                            : 'border border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => handleCategoryToggle(category.id)}
                        data-testid={`category-${category.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl" style={{ color: category.color || '#6B7280' }}>
                            {category.icon}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                            {category.subjects && category.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {category.subjects.slice(0, 3).map((subject) => (
                                  <Badge key={subject} variant="secondary" className="text-xs">
                                    {subject.replace('_', ' ')}
                                  </Badge>
                                ))}
                                {category.subjects.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{category.subjects.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-purple-500">
                              ✓
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Selected categories summary */}
          {selectedCategories.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">
                Selected Categories ({selectedCategories.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryId) => {
                  const category = finalCategories?.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} className="bg-purple-100 text-purple-800">
                      {category.icon} {category.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-gray-500">
              Select at least one category to continue
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={handleSkip}
                disabled={completeOnboarding.isPending}
                data-testid="button-skip"
              >
                Skip for now
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={selectedCategories.length === 0 || completeOnboarding.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                data-testid="button-complete-onboarding"
              >
                {completeOnboarding.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Completing...</span>
                  </div>
                ) : (
                  `Next (${selectedCategories.length} selected)`
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}