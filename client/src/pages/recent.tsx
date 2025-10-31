import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  Download,
  Star,
  User,
  Eye,
  Calendar,
  BookOpen,
  TrendingUp,
  Sparkles,
  Timer,
  Plus
} from 'lucide-react';
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface RecentNote {
  id: number;
  title: string;
  subject: string;
  author: string;
  rating: number;
  downloads: number;
  price: number;
  preview: string;
  uploadedAt: string;
  tags: string[];
  isNew: boolean;
  hoursAgo: number;
  authorLevel: 'student' | 'topper' | 'verified';
}

const recentNotes: RecentNote[] = [
  {
    id: 1,
    title: "Advanced Machine Learning Algorithms",
    subject: "Computer Science",
    author: "Arjun T.",
    rating: 4.9,
    downloads: 45,
    price: 399,
    preview: "Comprehensive guide to ML algorithms including neural networks, decision trees, and ensemble methods with Python implementations.",
    uploadedAt: "2024-01-15T14:30:00Z",
    tags: ["Machine Learning", "Python", "AI", "Algorithms"],
    isNew: true,
    hoursAgo: 2,
    authorLevel: 'topper'
  },
  {
    id: 2,
    title: "Quantum Mechanics Fundamentals",
    subject: "Physics",
    author: "Deepika M.",
    rating: 4.8,
    downloads: 32,
    price: 279,
    preview: "Essential quantum mechanics concepts with wave functions, operators, and applications in modern physics.",
    uploadedAt: "2024-01-15T12:15:00Z",
    tags: ["Quantum Physics", "Modern Physics", "Wave Functions"],
    isNew: true,
    hoursAgo: 4,
    authorLevel: 'verified'
  },
  {
    id: 3,
    title: "Organic Reaction Mechanisms",
    subject: "Chemistry",
    author: "Priya M.",
    rating: 4.7,
    downloads: 67,
    price: 249,
    preview: "Detailed organic chemistry reaction mechanisms with electron movement, intermediates, and stereochemistry.",
    uploadedAt: "2024-01-15T10:45:00Z",
    tags: ["Organic Chemistry", "Reactions", "Mechanisms", "JEE"],
    isNew: true,
    hoursAgo: 6,
    authorLevel: 'topper'
  },
  {
    id: 4,
    title: "Differential Equations Solutions",
    subject: "Mathematics",
    author: "Rahul K.",
    rating: 4.6,
    downloads: 89,
    price: 199,
    preview: "Complete guide to solving differential equations with methods, applications, and engineering examples.",
    uploadedAt: "2024-01-15T08:20:00Z",
    tags: ["Mathematics", "Differential Equations", "Engineering"],
    isNew: false,
    hoursAgo: 8,
    authorLevel: 'topper'
  },
  {
    id: 5,
    title: "Cell Division and Genetics",
    subject: "Biology",
    author: "Sneha P.",
    rating: 4.5,
    downloads: 54,
    price: 179,
    preview: "Comprehensive notes on mitosis, meiosis, genetic inheritance, and molecular genetics for NEET preparation.",
    uploadedAt: "2024-01-14T22:30:00Z",
    tags: ["Biology", "Genetics", "Cell Division", "NEET"],
    isNew: false,
    hoursAgo: 18,
    authorLevel: 'verified'
  },
  {
    id: 6,
    title: "Modern Indian History",
    subject: "History",
    author: "Kavya R.",
    rating: 4.4,
    downloads: 76,
    price: 149,
    preview: "Detailed coverage of Indian independence movement, freedom fighters, and post-independence developments.",
    uploadedAt: "2024-01-14T20:15:00Z",
    tags: ["History", "Indian History", "Independence", "UPSC"],
    isNew: false,
    hoursAgo: 20,
    authorLevel: 'student'
  },
  {
    id: 7,
    title: "English Literature Analysis",
    subject: "English",
    author: "Vikram L.",
    rating: 4.3,
    downloads: 43,
    price: 129,
    preview: "Literary analysis of major works including Shakespeare, poetry analysis techniques, and essay writing tips.",
    uploadedAt: "2024-01-14T18:45:00Z",
    tags: ["English", "Literature", "Shakespeare", "Poetry"],
    isNew: false,
    hoursAgo: 22,
    authorLevel: 'student'
  },
  {
    id: 8,
    title: "Thermodynamics and Heat Transfer",
    subject: "Physics",
    author: "Anita S.",
    rating: 4.7,
    downloads: 91,
    price: 229,
    preview: "Complete thermodynamics notes with laws, cycles, entropy, and heat transfer mechanisms with solved problems.",
    uploadedAt: "2024-01-14T16:30:00Z",
    tags: ["Physics", "Thermodynamics", "Heat Transfer", "Engineering"],
    isNew: false,
    hoursAgo: 24,
    authorLevel: 'topper'
  }
];

const timeFilters = [
  { label: "Last 6 hours", value: 6 },
  { label: "Last 12 hours", value: 12 },
  { label: "Last 24 hours", value: 24 },
  { label: "Last 3 days", value: 72 },
  { label: "Last week", value: 168 },
];

export default function RecentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState(168); // Default to last week
  const { toast } = useToast();

  const filteredNotes = recentNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTime = note.hoursAgo <= timeFilter;
    
    return matchesSearch && matchesTime;
  });

  const handleDownload = (noteId: number, noteTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading "${noteTitle}"...`,
    });
  };

  const getAuthorBadge = (level: string) => {
    switch (level) {
      case 'topper':
        return { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: "⭐", text: "Topper" };
      case 'verified':
        return { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "✓", text: "Verified" };
      default:
        return { color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: "👤", text: "Student" };
    }
  };

  const getTimeAgoText = (hoursAgo: number) => {
    if (hoursAgo < 1) return "Just now";
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  };

  const newNotesCount = filteredNotes.filter(note => note.isNew).length;
  const totalDownloads = filteredNotes.reduce((sum, note) => sum + note.downloads, 0);
  const averageRating = filteredNotes.reduce((sum, note) => sum + note.rating, 0) / filteredNotes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar currentMode="browse" />
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  ⏰ Recently Added Notes
                  {newNotesCount > 0 && (
                    <Badge className="ml-3 bg-green-500/20 text-green-300 border-green-500/30 animate-pulse">
                      {newNotesCount} New
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-400">Fresh content uploaded by our community</p>
              </div>
            </div>

            {/* Recent Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/20 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <Sparkles className="h-8 w-8 text-green-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-2xl font-bold text-white">{newNotesCount}</div>
                  <div className="text-sm text-gray-400">New Today</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{filteredNotes.length}</div>
                  <div className="text-sm text-gray-400">Recent Notes</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{totalDownloads}</div>
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

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search recent notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Time Filter */}
              <div className="md:w-48">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value))}
                  className="w-full p-2 bg-black/20 border border-gray-600 rounded text-white"
                >
                  {timeFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-400">
              Showing {filteredNotes.length} notes from the {timeFilters.find(f => f.value === timeFilter)?.label.toLowerCase()}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Recent Notes List */}
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const authorBadge = getAuthorBadge(note.authorLevel);
              
              return (
                <Card key={note.id} className="bg-black/20 border-gray-600 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Time Indicator */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className={`w-12 h-12 rounded-full ${note.isNew ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-gray-500/20 border-2 border-gray-500/30'} flex items-center justify-center mx-auto mb-1`}>
                          {note.isNew ? (
                            <Sparkles className="h-5 w-5 text-green-400 animate-pulse" />
                          ) : (
                            <Timer className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getTimeAgoText(note.hoursAgo)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {note.subject}
                              </Badge>
                              {note.isNew && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 animate-pulse">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  New
                                </Badge>
                              )}
                              <Badge className={authorBadge.color}>
                                {authorBadge.icon} {authorBadge.text}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {note.title}
                            </h3>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{note.author}</span>
                              <Calendar className="h-4 w-4 text-gray-400 ml-4" />
                              <span className="text-sm text-gray-400">
                                {new Date(note.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                              {note.preview}
                            </p>
                          </div>
                        </div>

                        {/* Stats and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{note.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-4 w-4 text-green-400" />
                              <span>{note.downloads}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{getTimeAgoText(note.hoursAgo)}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-xl font-bold text-green-400">
                              ₹{note.price}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDownload(note.id, note.title)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-4">
                          {note.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No recent notes found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your time filter or search terms
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  Clear Search
                </Button>
                <Button
                  onClick={() => setTimeFilter(168)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  Show All Recent
                </Button>
              </div>
            </div>
          )}

          {/* Upload Encouragement */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Share Your Knowledge</h4>
                <p className="text-gray-400">
                  Upload your notes and help fellow students. Earn coins for every download!
                </p>
              </div>
              <Link href="/upload">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
