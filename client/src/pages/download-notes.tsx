import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Eye,
  Heart,
  Calendar,
  Crown,
  Zap
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import SubscriptionModal from "@/components/subscription-modal";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
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
}

interface FirebaseNote {
  id: string;
  title?: string;
  subject?: string;
  userEmail?: string;
  rating?: number;
  downloads?: number;
  price?: number;
  description?: string;
  createdAt?: string;
  tags?: string[];
  isApproved?: boolean;
  approvalStatus?: string;
}

// Notes will be loaded from the Firebase admin server
const sampleNotes: Note[] = [];

export default function DownloadNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [dodoPaymentOpen, setDodoPaymentOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [userStatus, setUserStatus] = useState<'free' | 'trial' | 'premium'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('userStatus') as 'free' | 'trial' | 'premium') || 'free';
    }
    return 'free';
  });
  const [trialDownloads, setTrialDownloads] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('trialDownloads') || '0', 10);
    }
    return 0;
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const subjects = ['All', 'Chemistry', 'Computer Science', 'Mathematics', 'Biology', 'Physics', 'English'];

  // Fetch approved notes from Firebase admin server
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/notes', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.notes) {
        // Filter only approved notes and transform to match Note interface
        const approvedNotes = data.notes
          .filter((note: FirebaseNote) => note.isApproved || note.approvalStatus === 'approved')
          .map((note: FirebaseNote, index: number) => ({
            id: index + 1, // Convert string ID to number for compatibility
            title: note.title || 'Untitled Note',
            subject: note.subject || 'General',
            author: note.userEmail || 'Anonymous',
            rating: note.rating || 4.5,
            downloads: note.downloads || 0,
            price: note.price || 0,
            preview: note.description || 'No description available',
            date: note.createdAt || new Date().toISOString(),
            tags: note.tags || [note.subject || 'General']
          }));
        
        setNotes(approvedNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDownloadClick = (note: Note) => {
    if (userStatus === 'premium') {
      // Direct download for premium users
      handleDirectDownload(note);
    } else if (userStatus === 'trial' && trialDownloads < 3) {
      // Allow download for trial users with remaining downloads
      handleDirectDownload(note);
      const newCount = trialDownloads + 1;
      setTrialDownloads(newCount);
      localStorage.setItem('trialDownloads', newCount.toString());
    } else if (note.price > 0) {
      // Show Dodo payment gateway for paid notes
      setSelectedNote(note);
      setDodoPaymentOpen(true);
    } else {
      // Show subscription modal for free users or trial users who exceeded limit
      setSelectedNote(note);
      setSubscriptionModalOpen(true);
    }
  };

  const handleDirectDownload = (note: Note) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading "${note.title}"...`,
    });
    
    // In a real app, this would trigger the actual download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `"${note.title}" has been downloaded successfully!`,
      });
    }, 2000);
  };

  const handleSubscribe = (plan: string) => {
    // Navigate to subscription page with selected plan
    setLocation(`/subscribe?plan=${plan}&returnTo=/download-notes`);
    setSubscriptionModalOpen(false);
  };

  const handleStartTrial = () => {
    setUserStatus('trial');
    setTrialDownloads(0);
    
    // Store in localStorage
    localStorage.setItem('userStatus', 'trial');
    localStorage.setItem('trialDownloads', '0');
    
    toast({
      title: "Trial Started!",
      description: "You now have 3 free downloads. Enjoy exploring our notes!",
    });
    
    // Download the selected note
    if (selectedNote) {
      handleDirectDownload(selectedNote);
      const newCount = 1;
      setTrialDownloads(newCount);
      localStorage.setItem('trialDownloads', newCount.toString());
    }
  };

  const getDownloadButtonText = () => {
    if (userStatus === 'premium') return 'Download';
    if (userStatus === 'trial') {
      const remaining = 3 - trialDownloads;
      return remaining > 0 ? `Download (${remaining} left)` : 'Upgrade to Download';
    }
    return 'Download';
  };

  const getDownloadButtonVariant = () => {
    if (userStatus === 'trial' && trialDownloads >= 3) return 'outline';
    return 'default';
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Calculate subject counts dynamically
  const getSubjectCount = (subjectName: string) => {
    if (subjectName === 'All') return notes.length;
    return notes.filter(note => note.subject === subjectName).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-gray-800/20 to-slate-700/30 animate-study-pulse"></div>
      </div>
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    📚 Download Study Notes
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Access thousands of high-quality study materials from top students
                  </p>
                </div>
                
                {/* Trial Status */}
                {userStatus === 'trial' && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-green-400 animate-pulse" />
                      <span className="font-bold text-green-400">FREE TRIAL ACTIVE</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{3 - trialDownloads}</div>
                    <div className="text-sm text-green-300">Downloads Remaining</div>
                  </div>
                )}
                
                {userStatus === 'premium' && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-purple-400 animate-pulse" />
                      <span className="font-bold text-purple-400">PREMIUM MEMBER</span>
                    </div>
                    <div className="text-lg font-bold text-white">Unlimited Downloads</div>
                  </div>
                )}
              </div>
            </div>
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search notes, subjects, or topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-4 text-lg bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  {/* Subject Filter */}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject} className="bg-slate-800">{subject}</option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="popular" className="bg-slate-800">Most Popular</option>
                    <option value="rating" className="bg-slate-800">Highest Rated</option>
                    <option value="recent" className="bg-slate-800">Most Recent</option>
                  </select>
                </div>

                <div className="text-gray-300 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Found {filteredNotes.length} notes
                </div>
              </div>
            </div>

            {/* Subject Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                📚 Browse by Subject
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  Quick Access
                </Badge>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "Mathematics", icon: "📐", color: "from-blue-500 to-cyan-500" },
                  { name: "Physics", icon: "⚛️", color: "from-purple-500 to-pink-500" },
                  { name: "Chemistry", icon: "🧪", color: "from-green-500 to-emerald-500" },
                  { name: "Biology", icon: "🧬", color: "from-orange-500 to-red-500" },
                  { name: "Computer Science", icon: "💻", color: "from-indigo-500 to-purple-500" },
                  { name: "English", icon: "📚", color: "from-pink-500 to-rose-500" }
                ].map((subject, index) => (
                  <button
                    key={subject.name}
                    onClick={() => setSelectedSubject(subject.name)}
                    className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedSubject === subject.name 
                        ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500' 
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {subject.icon}
                      </div>
                      <div className="font-bold text-white text-sm mb-1 group-hover:text-purple-300 transition-colors">
                        {subject.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getSubjectCount(subject.name)} notes
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedSubject === subject.name && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Clear Filter Button */}
              {selectedSubject !== 'All' && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSubject('All')}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    Clear Filter • Show All Subjects
                  </Button>
                </div>
              )}
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <Card key={note.id} className="bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                    <CardContent className="p-6">
                      {/* Note Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <User className="h-4 w-4" />
                          <span>{note.author}</span>
                        </div>
                      </div>

                      {/* Subject Badge */}
                      <div className="mb-3">
                        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 px-3 py-1">
                          {note.subject}
                        </Badge>
                      </div>

                      {/* Preview */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {note.preview}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs border border-slate-600">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{note.tags.length - 3} more</span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-white">{note.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-blue-400" />
                          <span className="text-white">{note.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className={`flex-1 ${getDownloadButtonVariant() === 'default' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                            : 'border-slate-600 text-gray-300 hover:bg-slate-700'}`}
                          variant={getDownloadButtonVariant()}
                          onClick={() => handleDownloadClick(note)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {getDownloadButtonText()}
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-xl">
                    <CardContent className="p-12 text-center">
                      <div className="mb-6">
                        <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Notes Available Yet</h3>
                        <p className="text-gray-400 text-lg mb-6">
                          We're building our collection of high-quality study notes. Check back soon!
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                          <h4 className="text-lg font-semibold text-purple-300 mb-2">📚 Want to Contribute?</h4>
                          <p className="text-gray-300 mb-4">
                            Share your study notes and help fellow students while earning coins!
                          </p>
                          <Link href="/upload-notes">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                              Upload Your Notes
                            </Button>
                          </Link>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
                          <h4 className="text-lg font-semibold text-blue-300 mb-2">🔔 Get Notified</h4>
                          <p className="text-gray-300 mb-4">
                            Be the first to know when new notes are available in your subjects.
                          </p>
                          <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/10">
                            Subscribe to Updates
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Load More - Only show if there are notes */}
            {filteredNotes.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" className="px-8 py-3 border-slate-600 text-gray-300 hover:bg-slate-800">
                  Load More Notes
                </Button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
        onStartTrial={handleStartTrial}
        noteTitle={selectedNote?.title || ''}
      />

      {/* Dodo Payment Gateway Modal */}
      {dodoPaymentOpen && selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="h-full overflow-y-auto">
            <DodoPaymentGateway
              noteId={selectedNote.id.toString()}
              noteTitle={selectedNote.title}
              notePrice={selectedNote.price}
              onBack={() => {
                setDodoPaymentOpen(false);
                setSelectedNote(null);
              }}
              onSuccess={() => {
                setDodoPaymentOpen(false);
                setSelectedNote(null);
                toast({
                  title: "Payment Successful!",
                  description: `"${selectedNote.title}" is now available for download.`,
                });
                // Refresh notes list
                fetchNotes();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
