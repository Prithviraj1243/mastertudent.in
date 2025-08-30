import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { EducationalCategory, UserEducationalPreference } from "@shared/schema";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('school');

  // Clear cache on component mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/educational-categories'] });
  }, []);

  // Fetch all educational categories
  const { data: categories, isLoading } = useQuery<EducationalCategory[]>({
    queryKey: ['/api/educational-categories'],
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const groupedCategories = categories?.reduce((acc, category) => {
    const categoryType = (category as any).category_type || (category as any).categoryType;
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
            Welcome to MasterStudent! 🎓
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
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-gray-600 mb-2">
                    Debug Info: Found {cats.length} categories in "{type}"
                  </div>
                  <div className="text-xs text-gray-500">
                    Categories: {cats.map(c => c.name).join(', ')}
                  </div>
                </div>
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
                  const category = categories?.find(c => c.id === categoryId);
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
                onClick={() => setLocation('/')}
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
                  `Complete Setup (${selectedCategories.length} selected)`
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}