import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3X3, 
  Search, 
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Monitor,
  PenTool,
  Globe,
  Music,
  Palette,
  TrendingUp,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface Category {
  id: string;
  name: string;
  icon: any;
  description: string;
  notesCount: number;
  color: string;
  bgColor: string;
  borderColor: string;
  popularTopics: string[];
  averageRating: number;
  totalDownloads: number;
}

const categories: Category[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    description: "Algebra, Calculus, Geometry, Trigonometry, Statistics",
    notesCount: 245,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    popularTopics: ["Calculus", "Algebra", "Geometry", "Trigonometry", "Statistics"],
    averageRating: 4.7,
    totalDownloads: 15420
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    description: "Mechanics, Thermodynamics, Optics, Modern Physics",
    notesCount: 189,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    popularTopics: ["Mechanics", "Thermodynamics", "Optics", "Quantum Physics", "Electromagnetism"],
    averageRating: 4.6,
    totalDownloads: 12350
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    description: "Organic, Inorganic, Physical Chemistry, Biochemistry",
    notesCount: 198,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    popularTopics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry"],
    averageRating: 4.8,
    totalDownloads: 13890
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    description: "Cell Biology, Genetics, Ecology, Human Anatomy",
    notesCount: 156,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    popularTopics: ["Cell Biology", "Genetics", "Ecology", "Human Anatomy", "Molecular Biology"],
    averageRating: 4.5,
    totalDownloads: 9870
  },
  {
    id: "computer-science",
    name: "Computer Science",
    icon: Monitor,
    description: "Programming, Data Structures, Algorithms, Web Development",
    notesCount: 167,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
    popularTopics: ["Data Structures", "Algorithms", "Programming", "Web Development", "Machine Learning"],
    averageRating: 4.9,
    totalDownloads: 18750
  },
  {
    id: "english",
    name: "English",
    icon: PenTool,
    description: "Literature, Grammar, Writing, Poetry, Essays",
    notesCount: 134,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    popularTopics: ["Literature", "Grammar", "Essay Writing", "Poetry", "Comprehension"],
    averageRating: 4.4,
    totalDownloads: 8920
  },
  {
    id: "history",
    name: "History",
    icon: Globe,
    description: "World History, Indian History, Ancient Civilizations",
    notesCount: 98,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    popularTopics: ["World History", "Indian History", "Ancient Civilizations", "Modern History"],
    averageRating: 4.3,
    totalDownloads: 6540
  },
  {
    id: "arts",
    name: "Arts & Music",
    icon: Palette,
    description: "Fine Arts, Music Theory, Drawing, Painting",
    notesCount: 67,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/30",
    popularTopics: ["Fine Arts", "Music Theory", "Drawing", "Painting", "Art History"],
    averageRating: 4.6,
    totalDownloads: 4320
  }
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.popularTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalNotes = categories.reduce((sum, cat) => sum + cat.notesCount, 0);
  const totalDownloads = categories.reduce((sum, cat) => sum + cat.totalDownloads, 0);
  const averageRating = categories.reduce((sum, cat) => sum + cat.averageRating, 0) / categories.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar currentMode="browse" />
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Grid3X3 className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">📚 Browse by Categories</h1>
                <p className="text-gray-400">Explore notes organized by subjects and topics</p>
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/20 border-indigo-500/20">
                <CardContent className="p-4 text-center">
                  <Grid3X3 className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{categories.length}</div>
                  <div className="text-sm text-gray-400">Categories</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalNotes.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Notes</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Downloads</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search categories or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className={`bg-black/20 border-gray-600 hover:${category.borderColor} transition-all duration-300 hover:scale-105 cursor-pointer`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 ${category.bgColor} rounded-xl`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.notesCount} notes available</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4">
                      {category.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{category.notesCount}</div>
                        <div className="text-xs text-gray-400">Notes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{category.averageRating}</div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{(category.totalDownloads / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-gray-400">Downloads</div>
                      </div>
                    </div>

                    {/* Popular Topics */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-300">Popular Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {category.popularTopics.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {topic}
                          </Badge>
                        ))}
                        {category.popularTopics.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            +{category.popularTopics.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedCategory === category.id && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-300 mb-2">All Topics:</div>
                            <div className="flex flex-wrap gap-1">
                              {category.popularTopics.map((topic, index) => (
                                <Badge key={index} className={`text-xs ${category.bgColor} ${category.color} ${category.borderColor}`}>
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Link href={`/browse?category=${category.id}`}>
                              <Button size="sm" className={`${category.bgColor} ${category.color} hover:opacity-80`}>
                                <BookOpen className="h-4 w-4 mr-1" />
                                Browse Notes
                              </Button>
                            </Link>
                            <Link href={`/categories/${category.id}/trending`}>
                              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Trending
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search terms
              </p>
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Quick Access */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">🚀 Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/browse?sort=popular">
                <Card className="bg-black/20 border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-white">Most Popular</div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/browse?sort=rating">
                <Card className="bg-black/20 border-gray-600 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-white">Highest Rated</div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/browse?sort=newest">
                <Card className="bg-black/20 border-gray-600 hover:border-green-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-white">Latest Notes</div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/browse?filter=free">
                <Card className="bg-black/20 border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-white">Free Notes</div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
