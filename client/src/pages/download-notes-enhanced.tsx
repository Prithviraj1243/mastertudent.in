import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Zap,
  Award,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import { motion } from 'framer-motion';
import SubscriptionModal from "@/components/subscription-modal";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
import { useToast } from "@/hooks/use-toast";
import PageWrapper from "@/components/layout/page-wrapper";

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
  exam?: string;
  class?: string;
  isTopperNote?: boolean;
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

// Competitive exams list
const COMPETITIVE_EXAMS = [
  'All Exams',
  'JEE Main',
  'JEE Advanced',
  'NEET',
  'GATE',
  'CAT',
  'UPSC',
  'Bank PO',
  'SSC'
];

// Classes list
const CLASSES = [
  'All Classes',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

export default function DownloadNotesEnhanced() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('All Exams');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [dodoPaymentOpen, setDodoPaymentOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showTopperModal, setShowTopperModal] = useState(false);
  const [isTopper, setIsTopper] = useState(false);
  const [topperDocuments, setTopperDocuments] = useState<File[]>([]);
  const [verifyingTopper, setVerifyingTopper] = useState(false);
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

  // Fetch notes
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
        const approvedNotes = data.notes
          .filter((note: FirebaseNote) => note.isApproved || note.approvalStatus === 'approved')
          .map((note: FirebaseNote, index: number) => ({
            id: index,
            title: note.title || 'Untitled',
            subject: note.subject || 'General',
            author: note.userEmail?.split('@')[0] || 'Anonymous',
            rating: note.rating || 4.5,
            downloads: note.downloads || 0,
            price: note.price || 0,
            preview: note.description || 'No preview available',
            date: note.createdAt || new Date().toISOString(),
            tags: note.tags || [],
            exam: 'JEE Main',
            class: 'Class 12',
            isTopperNote: false
          }));
        
        setNotes(approvedNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'All Exams' || note.exam === selectedExam;
    const matchesClass = selectedClass === 'All Classes' || note.class === selectedClass;
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    
    return matchesSearch && matchesExam && matchesClass && matchesSubject;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      default:
        return 0;
    }
  });

  const handleDownloadClick = (note: Note) => {
    setSelectedNote(note);
    if (note.price > 0) {
      setDodoPaymentOpen(true);
    } else {
      if (userStatus === 'free' && trialDownloads >= 3) {
        setSubscriptionModalOpen(true);
      } else {
        toast({
          title: "Download Started",
          description: `Downloading: ${note.title}`,
          variant: "default"
        });
      }
    }
  };

  const handleTopperVerification = async () => {
    if (topperDocuments.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive"
      });
      return;
    }

    setVerifyingTopper(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsTopper(true);
      localStorage.setItem('isTopper', 'true');
      
      toast({
        title: "Success!",
        description: "You've been verified as a Topper! 🎉",
        variant: "default"
      });
      
      setShowTopperModal(false);
      setTopperDocuments([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify topper status",
        variant: "destructive"
      });
    } finally {
      setVerifyingTopper(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTopperDocuments([...topperDocuments, ...Array.from(e.target.files)]);
    }
  };

  return (
    <PageWrapper
      title="Download Notes"
      subtitle="Access premium study materials"
      icon={<BookOpen className="h-6 w-6 text-white" />}
    >
      <div className="space-y-8">

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-blue-400" />
            <Input
              placeholder="Search notes by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Exam Filter */}
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-4">
            <label className="text-blue-300 text-sm font-semibold mb-2 block">Competitive Exam</label>
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-slate-700 border border-blue-500/30 text-white rounded px-3 py-2 focus:border-blue-400 focus:ring-blue-400/20"
            >
              {COMPETITIVE_EXAMS.map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-4">
            <label className="text-blue-300 text-sm font-semibold mb-2 block">Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-700 border border-blue-500/30 text-white rounded px-3 py-2 focus:border-blue-400 focus:ring-blue-400/20"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-4">
            <label className="text-blue-300 text-sm font-semibold mb-2 block">Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-700 border border-blue-500/30 text-white rounded px-3 py-2 focus:border-blue-400 focus:ring-blue-400/20"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-4">
            <label className="text-blue-300 text-sm font-semibold mb-2 block">Sort By</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-700 border border-blue-500/30 text-white rounded px-3 py-2 focus:border-blue-400 focus:ring-blue-400/20"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-blue-300">
          <p className="text-sm">Found <span className="font-bold text-blue-400">{sortedNotes.length}</span> notes</p>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
            <p className="text-blue-300">No notes found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map((note) => (
              <div key={note.id} className="group">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 h-full overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className="h-32 bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-b border-blue-500/20 p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-blue-300 transition-colors">
                          {note.title}
                        </h3>
                      </div>
                      {note.isTopperNote && (
                        <Award className="h-5 w-5 text-amber-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        {note.exam}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                        {note.class}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Subject and Author */}
                    <div>
                      <p className="text-blue-300 text-sm font-semibold">{note.subject}</p>
                      <p className="text-blue-400/70 text-xs flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {note.author}
                      </p>
                    </div>

                    {/* Preview */}
                    <p className="text-blue-300/70 text-sm line-clamp-2">
                      {note.preview}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-blue-400/70">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{note.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{note.downloads} downloads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Price and Download Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                      <div>
                        {note.price > 0 ? (
                          <p className="text-blue-300 font-bold">₹{note.price}</p>
                        ) : (
                          <p className="text-green-400 font-bold">FREE</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDownloadClick(note)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscribe={(plan) => {
          setUserStatus('premium');
          localStorage.setItem('userStatus', 'premium');
        }}
        onStartTrial={() => {
          setUserStatus('trial');
          localStorage.setItem('userStatus', 'trial');
          localStorage.setItem('trialDownloads', '0');
        }}
        noteTitle={selectedNote?.title || ''}
      />

      {/* Dodo Payment Gateway */}
      {selectedNote && (
        <Dialog open={dodoPaymentOpen} onOpenChange={setDodoPaymentOpen}>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white p-0 m-0 relative border-0 rounded-2xl shadow-2xl">
            <DodoPaymentGateway
              noteId={`note-${selectedNote.id}`}
              noteTitle={selectedNote.title}
              notePrice={selectedNote.price}
              onBack={() => setDodoPaymentOpen(false)}
              onSuccess={() => {
                setDodoPaymentOpen(false);
                toast({
                  title: "Success!",
                  description: "Note downloaded successfully",
                  variant: "default"
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
