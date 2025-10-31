import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Search, 
  Download,
  Star,
  User,
  Eye,
  Calendar,
  Flame,
  Zap,
  Crown,
  Award
} from 'lucide-react';
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface TrendingNote {
  id: number;
  title: string;
  subject: string;
  author: string;
  rating: number;
  downloads: number;
  price: number;
  preview: string;
  date: string;
  tags: string[];
  trendingScore: number;
  weeklyGrowth: number;
  rank: number;
}

const trendingNotes: TrendingNote[] = [
  {
    id: 1,
    title: "Complete Organic Chemistry Notes",
    subject: "Chemistry",
    author: "Priya M.",
    rating: 4.9,
    downloads: 1250,
    price: 299,
    preview: "Comprehensive notes covering all organic chemistry topics with reaction mechanisms, named reactions, and practice problems.",
    date: "2024-01-15",
    tags: ["Chemistry", "Organic", "JEE", "NEET"],
    trendingScore: 98,
    weeklyGrowth: 45,
    rank: 1
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    author: "Arjun T.",
    rating: 4.9,
    downloads: 1100,
    price: 349,
    preview: "Complete DSA notes with code examples, complexity analysis, and interview preparation materials.",
    date: "2024-01-05",
    tags: ["Computer Science", "DSA", "Programming", "Interview"],
    trendingScore: 95,
    weeklyGrowth: 38,
    rank: 2
  },
  {
    id: 3,
    title: "Advanced Calculus & Integration",
    subject: "Mathematics",
    author: "Rahul K.",
    rating: 4.8,
    downloads: 980,
    price: 249,
    preview: "Detailed calculus notes with step-by-step solutions, integration techniques, and differential equations.",
    date: "2024-01-12",
    tags: ["Mathematics", "Calculus", "JEE", "Integration"],
    trendingScore: 92,
    weeklyGrowth: 32,
    rank: 3
  },
  {
    id: 4,
    title: "Trigonometry & Coordinate Geometry",
    subject: "Mathematics",
    author: "Vikram L.",
    rating: 4.7,
    downloads: 890,
    price: 229,
    preview: "Detailed notes on trigonometry, coordinate geometry, and analytical geometry with practice problems.",
    date: "2024-01-01",
    tags: ["Mathematics", "Trigonometry", "Geometry", "JEE"],
    trendingScore: 88,
    weeklyGrowth: 28,
    rank: 4
  },
  {
    id: 5,
    title: "Mechanics & Thermodynamics",
    subject: "Physics",
    author: "Anita S.",
    rating: 4.7,
    downloads: 850,
    price: 199,
    preview: "Complete physics notes covering mechanics, thermodynamics, and wave motion with solved examples.",
    date: "2024-01-10",
    tags: ["Physics", "Mechanics", "Thermodynamics", "JEE"],
    trendingScore: 85,
    weeklyGrowth: 25,
    rank: 5
  },
  {
    id: 6,
    title: "Modern Physics & Quantum",
    subject: "Physics",
    author: "Deepika M.",
    rating: 4.8,
    downloads: 760,
    price: 279,
    preview: "Advanced physics notes covering quantum mechanics, atomic structure, and modern physics concepts.",
    date: "2023-12-28",
    tags: ["Physics", "Quantum", "Modern Physics", "Advanced"],
    trendingScore: 82,
    weeklyGrowth: 22,
    rank: 6
  },
  {
    id: 7,
    title: "Cell Biology & Genetics",
    subject: "Biology",
    author: "Sneha P.",
    rating: 4.6,
    downloads: 720,
    price: 179,
    preview: "Comprehensive biology notes on cell structure, genetics, molecular biology, and biotechnology.",
    date: "2024-01-08",
    tags: ["Biology", "Genetics", "Cell Biology", "NEET"],
    trendingScore: 78,
    weeklyGrowth: 18,
    rank: 7
  },
  {
    id: 8,
    title: "Inorganic Chemistry Formulas",
    subject: "Chemistry",
    author: "Kavya R.",
    rating: 4.5,
    downloads: 650,
    price: 149,
    preview: "Essential inorganic chemistry formulas, periodic trends, and coordination compounds.",
    date: "2024-01-03",
    tags: ["Chemistry", "Inorganic", "Formulas", "JEE"],
    trendingScore: 75,
    weeklyGrowth: 15,
    rank: 8
  }
];

export default function TrendingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredNotes = trendingNotes.filter(note => {
    return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
           note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleDownload = (noteId: number, noteTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading "${noteTitle}"...`,
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30", text: "#1" };
    if (rank === 2) return { icon: Award, color: "text-gray-300 bg-gray-500/20 border-gray-500/30", text: "#2" };
    if (rank === 3) return { icon: Award, color: "text-orange-400 bg-orange-500/20 border-orange-500/30", text: "#3" };
    return { icon: TrendingUp, color: "text-blue-400 bg-blue-500/20 border-blue-500/30", text: `#${rank}` };
  };

  const getTrendingIcon = (score: number) => {
    if (score >= 95) return { icon: Flame, color: "text-red-400", animation: "animate-bounce" };
    if (score >= 85) return { icon: Zap, color: "text-yellow-400", animation: "animate-pulse" };
    return { icon: TrendingUp, color: "text-blue-400", animation: "" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar currentMode="browse" />
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  🔥 Trending Notes
                  <Badge className="ml-3 bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                    Hot
                  </Badge>
                </h1>
                <p className="text-gray-400">Most popular notes this week</p>
              </div>
            </div>

            {/* Trending Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/20 border-red-500/20">
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 text-red-400 mx-auto mb-2 animate-bounce" />
                  <div className="text-2xl font-bold text-white">{trendingNotes.length}</div>
                  <div className="text-sm text-gray-400">Trending Notes</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-2xl font-bold text-white">
                    {Math.round(trendingNotes.reduce((acc, note) => acc + note.weeklyGrowth, 0) / trendingNotes.length)}%
                  </div>
                  <div className="text-sm text-gray-400">Avg Growth</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {trendingNotes.reduce((acc, note) => acc + note.downloads, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Downloads</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(trendingNotes.reduce((acc, note) => acc + note.rating, 0) / trendingNotes.length).toFixed(1)}
                  </div>
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
                placeholder="Search trending notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Trending Notes List */}
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const rankBadge = getRankBadge(note.rank);
              const trendingIcon = getTrendingIcon(note.trendingScore);
              const RankIcon = rankBadge.icon;
              const TrendIcon = trendingIcon.icon;

              return (
                <Card key={note.id} className="bg-black/20 border-gray-600 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl ${rankBadge.color} flex items-center justify-center`}>
                        <div className="text-center">
                          <RankIcon className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-xs font-bold">{rankBadge.text}</div>
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
                              <Badge className={`${trendingIcon.color} bg-red-500/20 border-red-500/30 ${trendingIcon.animation}`}>
                                <TrendIcon className="h-3 w-3 mr-1" />
                                {note.trendingScore}% Hot
                              </Badge>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                +{note.weeklyGrowth}% this week
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {note.title}
                            </h3>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{note.author}</span>
                            </div>
                            
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                              {note.preview}
                            </p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{note.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-4 w-4 text-green-400" />
                              <span>{note.downloads.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(note.date).toLocaleDateString()}</span>
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
                                className="bg-red-600 hover:bg-red-700"
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
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No trending notes found</h3>
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

          {/* Trending Info */}
          <div className="mt-8 p-4 bg-black/20 rounded-lg border border-red-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="h-5 w-5 text-red-400" />
              <h4 className="font-semibold text-white">How Trending Works</h4>
            </div>
            <p className="text-sm text-gray-400">
              Notes are ranked based on download velocity, user ratings, and engagement metrics. 
              The trending score is updated every hour to reflect the most popular content.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
