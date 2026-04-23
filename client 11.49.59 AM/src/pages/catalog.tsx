import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Filter, X, BookOpen, Star, Download, Eye, TrendingUp, Sparkles, Zap, Flame } from "lucide-react";
import NoteCard from "@/components/notes/note-card";
import { Note } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Helper function to get subject icons
const getSubjectIcon = (subject: string) => {
  const icons: { [key: string]: string } = {
    'Mathematics': '📐',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Computer Science': '💻',
    'English': '📚',
    'History': '📜',
    'Geography': '🌍',
    'Economics': '💰',
    'Political Science': '🏛️'
  };
  return icons[subject] || '📖';
};

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Get categoryId from URL params (from exam selection flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategoryId = urlParams.get('categoryId');
    if (selectedCategoryId) {
      setCategoryId(selectedCategoryId);
    }
  }, []);

  // Fetch educational categories
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/educational-categories'],
  });

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["/api/notes", { search, subject, classGrade, categoryId, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (subject && subject !== "all") params.append("subject", subject);
      if (classGrade && classGrade !== "all") params.append("classGrade", classGrade);
      if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/notes?${params}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", 
    "English", "History", "Geography", "Economics", "Political Science"
  ];

  const classes = [
    "Class 9", "Class 10", "Class 11", "Class 12", "Undergraduate", "Postgraduate"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
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

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Header />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6" role="main">
          {/* Hero Header Section */}
          <header className="mb-8">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 p-6 md:p-8 shadow-2xl mb-8">
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                      <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-white animate-bounce" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-testid="text-catalog-title">
                        📚 Browse Study Notes
                      </h1>
                      <p className="text-white/90 text-base md:text-lg font-medium" data-testid="text-catalog-description">
                        Discover premium notes from top students • Find your perfect study material
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-300 mr-2 animate-pulse" />
                        <span className="text-sm font-bold text-white">LIVE CATALOG</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-300">10,000+</div>
                      <div className="text-xs text-white/80">Premium Notes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-white">🔍 Search & Filter</h2>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                  Real-time
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-slate-800/60 text-white border-slate-600"}
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-slate-800/60 text-white border-slate-600"}
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-xl border border-slate-600/50 mb-6">
              {/* Main Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="🔍 Search for notes, topics, or authors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-300"
                  data-testid="input-search"
                />
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { name: "Popular", icon: "🔥", color: "from-red-500 to-orange-500" },
                  { name: "Recent", icon: "⚡", color: "from-blue-500 to-cyan-500" },
                  { name: "Highly Rated", icon: "⭐", color: "from-yellow-500 to-orange-500" },
                  { name: "Trending", icon: "📈", color: "from-green-500 to-emerald-500" },
                  { name: "Premium", icon: "💎", color: "from-purple-500 to-pink-500" }
                ].map((filter, index) => (
                  <Button
                    key={filter.name}
                    className={`bg-gradient-to-r ${filter.color} text-white hover:scale-105 transition-all duration-300 shadow-lg`}
                    size="sm"
                    style={{animationDelay: `${index * 0.1}s`}}
                    data-testid={`filter-${filter.name.toLowerCase()}`}
                  >
                    <span className="mr-2">{filter.icon}</span>
                    {filter.name}
                  </Button>
                ))}
              </div>

              {/* Detailed Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white hover:border-purple-500 transition-colors" data-testid="select-subject">
                    <SelectValue placeholder="📚 All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">All Subjects</SelectItem>
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj} className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <span>{getSubjectIcon(subj)}</span>
                          {subj}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={classGrade} onValueChange={setClassGrade}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white hover:border-purple-500 transition-colors" data-testid="select-class">
                    <SelectValue placeholder="🎓 All Classes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls} className="text-white hover:bg-slate-700">{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white hover:border-purple-500 transition-colors" data-testid="select-category">
                    <SelectValue placeholder="📂 All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <span className="text-xs text-slate-400">
                            ({category.categoryType.replace('_', ' ')})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="recent">
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white hover:border-purple-500 transition-colors" data-testid="select-sort">
                    <SelectValue placeholder="🔄 Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="recent" className="text-white hover:bg-slate-700">Most Recent</SelectItem>
                    <SelectItem value="popular" className="text-white hover:bg-slate-700">Most Popular</SelectItem>
                    <SelectItem value="rating" className="text-white hover:bg-slate-700">Highest Rated</SelectItem>
                    <SelectItem value="downloads" className="text-white hover:bg-slate-700">Most Downloaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    setSearch("");
                    setSubject("");
                    setClassGrade("");
                    setPage(1);
                  }}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white transition-all duration-300 hover:scale-105"
                  data-testid="button-clear-filters"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>


            {/* Active Filters Display */}
            {(search || subject || classGrade) && (
              <div className="bg-slate-700/30 backdrop-blur-md rounded-xl p-4 mt-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-slate-300 font-medium">🏷️ Active filters:</span>
                  {search && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => setSearch("")}>
                      Search: "{search}" <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                  {subject && (
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => setSubject("")}>
                      {getSubjectIcon(subject)} {subject} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                  {classGrade && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => setClassGrade("")}>
                      🎓 {classGrade} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Notes Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
                <p className="text-slate-300 animate-pulse">Loading amazing notes...</p>
              </div>
            </div>
          ) : notesData?.notes?.length > 0 ? (
            <>
              <div 
                className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
                    : "space-y-4"
                }
                data-testid="notes-container"
              >
                {notesData.notes.map((note: Note) => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} />
                ))}
              </div>
            </>
          ) : (
            // Show sample notes when no API data
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-white">🔥 Featured Notes</h3>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 animate-pulse">
                    Live
                  </Badge>
                </div>
              </div>
              
              <div 
                className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
                    : "space-y-4"
                }
                data-testid="notes-container"
              >
                {[
                  {
                    id: 1,
                    title: "Complete JEE Advanced Physics Solutions",
                    subject: "Physics",
                    class: "Class 12",
                    author: "Arjun Sharma",
                    rating: 4.9,
                    downloads: 2847,
                    preview: "⚛️",
                    color: "from-blue-500 to-cyan-500",
                    badge: "🏆 Top Rated"
                  },
                  {
                    id: 2,
                    title: "Organic Chemistry Reaction Mechanisms",
                    subject: "Chemistry", 
                    class: "Class 12",
                    author: "Priya Patel",
                    rating: 4.8,
                    downloads: 1923,
                    preview: "🧪",
                    color: "from-green-500 to-emerald-500",
                    badge: "🔥 Hot"
                  },
                  {
                    id: 3,
                    title: "Data Structures & Algorithms Masterclass",
                    subject: "Computer Science",
                    class: "College",
                    author: "Rahul Kumar",
                    rating: 4.9,
                    downloads: 3156,
                    preview: "💻",
                    color: "from-purple-500 to-pink-500",
                    badge: "💎 Premium"
                  },
                  {
                    id: 4,
                    title: "Calculus Integration Techniques",
                    subject: "Mathematics",
                    class: "Class 12",
                    author: "Sneha Gupta",
                    rating: 4.7,
                    downloads: 1654,
                    preview: "📐",
                    color: "from-orange-500 to-red-500",
                    badge: "📈 Rising"
                  },
                  {
                    id: 5,
                    title: "NEET Biology Complete Notes",
                    subject: "Biology",
                    class: "Class 12",
                    author: "Dr. Amit Singh",
                    rating: 4.8,
                    downloads: 2234,
                    preview: "🧬",
                    color: "from-teal-500 to-cyan-500",
                    badge: "🎯 Targeted"
                  },
                  {
                    id: 6,
                    title: "English Literature Analysis Guide",
                    subject: "English",
                    class: "Class 12",
                    author: "Maya Krishnan",
                    rating: 4.6,
                    downloads: 987,
                    preview: "📚",
                    color: "from-indigo-500 to-purple-500",
                    badge: "📚 Classic"
                  },
                  {
                    id: 7,
                    title: "Modern History of India",
                    subject: "History",
                    class: "Class 10",
                    author: "Vikash Sharma",
                    rating: 4.5,
                    downloads: 756,
                    preview: "📜",
                    color: "from-yellow-500 to-orange-500",
                    badge: "📖 Detailed"
                  },
                  {
                    id: 8,
                    title: "Microeconomics Fundamentals",
                    subject: "Economics",
                    class: "Class 11",
                    author: "Ravi Patel",
                    rating: 4.7,
                    downloads: 1234,
                    preview: "💰",
                    color: "from-pink-500 to-rose-500",
                    badge: "💡 Insightful"
                  }
                ].map((note, index) => (
                  <div key={note.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 hover:border-slate-500/70 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-4 md:p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`bg-gradient-to-r ${note.color} rounded-xl p-2 md:p-3 text-xl md:text-2xl shadow-lg`}>
                            {note.preview}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs mb-1">
                              {note.badge}
                            </Badge>
                            <div className="text-xs text-slate-400">{note.class}</div>
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-white text-sm mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-xs text-slate-300 mb-3">by {note.author}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-semibold text-white">{note.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-slate-300">{note.downloads.toLocaleString()}</span>
                          </div>
                          <Badge className={`bg-gradient-to-r ${note.color} text-white text-xs`}>
                            {note.subject}
                          </Badge>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs px-3 py-1 hover:scale-105 transition-all duration-300">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 text-lg hover:scale-105 transition-all duration-300 shadow-lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Load More Amazing Notes
            </Button>
          </div>

          {/* Pagination */}
          {notesData?.total > 20 && (
            <div className="flex items-center justify-center mt-8" data-testid="pagination">
              <nav className="flex items-center space-x-3">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="bg-slate-800/60 text-white border-slate-600 hover:bg-slate-700/60"
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-slate-300 px-4 py-2 bg-slate-800/60 rounded-lg" data-testid="text-page-info">
                  Page {page} of {Math.ceil(notesData.total / 20)}
                </span>
                
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(notesData.total / 20)}
                  className="bg-slate-800/60 text-white border-slate-600 hover:bg-slate-700/60"
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
