import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  Filter,
  Download,
  Star,
  User,
  Eye,
  Heart,
  Calendar,
  Grid3X3,
  SlidersHorizontal,
  TrendingUp
} from 'lucide-react';
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface Note {
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
  trending?: boolean;
  featured?: boolean;
}

const allNotes: Note[] = [
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
    trending: true,
    featured: true
  },
  {
    id: 2,
    title: "Advanced Calculus & Integration",
    subject: "Mathematics",
    author: "Rahul K.",
    rating: 4.8,
    downloads: 980,
    price: 249,
    preview: "Detailed calculus notes with step-by-step solutions, integration techniques, and differential equations.",
    date: "2024-01-12",
    tags: ["Mathematics", "Calculus", "JEE", "Integration"],
    trending: true
  },
  {
    id: 3,
    title: "Mechanics & Thermodynamics",
    subject: "Physics",
    author: "Anita S.",
    rating: 4.7,
    downloads: 850,
    price: 199,
    preview: "Complete physics notes covering mechanics, thermodynamics, and wave motion with solved examples.",
    date: "2024-01-10",
    tags: ["Physics", "Mechanics", "Thermodynamics", "JEE"],
    featured: true
  },
  {
    id: 4,
    title: "Cell Biology & Genetics",
    subject: "Biology",
    author: "Sneha P.",
    rating: 4.6,
    downloads: 720,
    price: 179,
    preview: "Comprehensive biology notes on cell structure, genetics, molecular biology, and biotechnology.",
    date: "2024-01-08",
    tags: ["Biology", "Genetics", "Cell Biology", "NEET"]
  },
  {
    id: 5,
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    author: "Arjun T.",
    rating: 4.9,
    downloads: 1100,
    price: 349,
    preview: "Complete DSA notes with code examples, complexity analysis, and interview preparation materials.",
    date: "2024-01-05",
    tags: ["Computer Science", "DSA", "Programming", "Interview"],
    trending: true
  },
  {
    id: 6,
    title: "Inorganic Chemistry Formulas",
    subject: "Chemistry",
    author: "Kavya R.",
    rating: 4.5,
    downloads: 650,
    price: 149,
    preview: "Essential inorganic chemistry formulas, periodic trends, and coordination compounds.",
    date: "2024-01-03",
    tags: ["Chemistry", "Inorganic", "Formulas", "JEE"]
  },
  {
    id: 7,
    title: "Trigonometry & Coordinate Geometry",
    subject: "Mathematics",
    author: "Vikram L.",
    rating: 4.7,
    downloads: 890,
    price: 229,
    preview: "Detailed notes on trigonometry, coordinate geometry, and analytical geometry with practice problems.",
    date: "2024-01-01",
    tags: ["Mathematics", "Trigonometry", "Geometry", "JEE"]
  },
  {
    id: 8,
    title: "Modern Physics & Quantum",
    subject: "Physics",
    author: "Deepika M.",
    rating: 4.8,
    downloads: 760,
    price: 279,
    preview: "Advanced physics notes covering quantum mechanics, atomic structure, and modern physics concepts.",
    date: "2023-12-28",
    tags: ["Physics", "Quantum", "Modern Physics", "Advanced"],
    featured: true
  }
];

const subjects = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"];
const sortOptions = ["Most Popular", "Highest Rated", "Newest", "Price: Low to High", "Price: High to Low"];

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filteredNotes = allNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === "All" || note.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case "Most Popular":
        return b.downloads - a.downloads;
      case "Highest Rated":
        return b.rating - a.rating;
      case "Newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "Price: Low to High":
        return a.price - b.price;
      case "Price: High to Low":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleDownload = (noteId: number, noteTitle: string) => {
    toast({
      title: "Download Started",
      description: `Downloading "${noteTitle}"...`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar currentMode="browse" />
        <main className="flex-1 p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Browse All Notes</h1>
                <p className="text-gray-400">Discover and download high-quality study materials</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/20 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{allNotes.length}</div>
                  <div className="text-sm text-gray-400">Total Notes</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{allNotes.filter(n => n.trending).length}</div>
                  <div className="text-sm text-gray-400">Trending</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{allNotes.filter(n => n.featured).length}</div>
                  <div className="text-sm text-gray-400">Featured</div>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-orange-500/20">
                <CardContent className="p-4 text-center">
                  <Grid3X3 className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{subjects.length - 1}</div>
                  <div className="text-sm text-gray-400">Subjects</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search notes, subjects, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/20 rounded-lg border border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 bg-black/30 border border-gray-600 rounded text-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-400">
              Showing {sortedNotes.length} of {allNotes.length} notes
              {selectedSubject !== "All" && ` in ${selectedSubject}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map((note) => (
              <Card key={note.id} className="bg-black/20 border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {note.subject}
                    </Badge>
                    <div className="flex space-x-1">
                      {note.trending && (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                          🔥 Hot
                        </Badge>
                      )}
                      {note.featured && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {note.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{note.author}</span>
                  </div>

                  {/* Preview */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                    {note.preview}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{note.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{note.downloads}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-400">
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
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {sortedNotes.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("All");
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
