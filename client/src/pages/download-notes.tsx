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
  Eye,
  Heart,
  Calendar,
  Crown,
  Zap,
  GraduationCap,
  FileText
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import SubscriptionModal from "@/components/subscription-modal";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  description?: string;
  status: string;
  topperId?: string;
  downloadsCount: number;
  viewsCount: number;
  likesCount: number;
  price: number;
  classGrade?: string;
  attachments?: string[];
  createdAt: string;
  publishedAt?: string;
}

const CLASS_OPTIONS = ['All Classes', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const SUBJECTS = [
  { name: "Mathematics", icon: "📐", color: "from-blue-500 to-cyan-500" },
  { name: "Physics", icon: "⚛️", color: "from-purple-500 to-pink-500" },
  { name: "Chemistry", icon: "🧪", color: "from-green-500 to-emerald-500" },
  { name: "Biology", icon: "🧬", color: "from-orange-500 to-red-500" },
  { name: "Computer_Science", icon: "💻", color: "from-indigo-500 to-purple-500" },
  { name: "English", icon: "📚", color: "from-pink-500 to-rose-500" },
  { name: "History", icon: "📜", color: "from-yellow-500 to-amber-500" },
  { name: "Geography", icon: "🗺️", color: "from-teal-500 to-cyan-500" },
];

export default function DownloadNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All Classes');
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

  // Fetch approved/published notes from backend
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.set('subject', selectedSubject);
      if (selectedClass !== 'All Classes') params.set('classGrade', selectedClass);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      params.set('limit', '50');

      const response = await fetch(`/api/notes?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // API returns { notes, total, page, limit }
      const notesList: Note[] = (data.notes || []);
      setNotes(notesList);
      setTotal(data.total || notesList.length);
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

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchNotes();
  }, [selectedSubject, selectedClass, searchTerm]);

  // Handle payment return
  useEffect(() => {
    const returnUrl = localStorage.getItem('payment_return_url');
    const paymentPlan = localStorage.getItem('payment_plan');
    if (returnUrl && window.location.href.includes('/download-notes')) {
      localStorage.removeItem('payment_return_url');
      localStorage.removeItem('payment_plan');
      setUserStatus('premium');
      localStorage.setItem('userStatus', 'premium');
      toast({
        title: "Payment Successful! 🎉",
        description: `Your ${paymentPlan || 'monthly'} subscription is now active. Enjoy unlimited downloads!`,
        duration: 5000,
      });
    }
  }, []);

  const handleDownloadClick = (note: Note) => {
    if (userStatus === 'premium') {
      handleDirectDownload(note);
    } else if (userStatus === 'trial' && trialDownloads < 3) {
      handleDirectDownload(note);
      const newCount = trialDownloads + 1;
      setTrialDownloads(newCount);
      localStorage.setItem('trialDownloads', newCount.toString());
    } else if (note.price > 0) {
      setSelectedNote(note);
      setDodoPaymentOpen(true);
    } else {
      setSelectedNote(note);
      setSubscriptionModalOpen(true);
    }
  };

  const handleDirectDownload = (note: Note) => {
    // If there are real attachment URLs, open the first one
    if (note.attachments && note.attachments.length > 0) {
      window.open(note.attachments[0], '_blank');
      toast({
        title: "Download Started ✅",
        description: `Opening "${note.title}"...`,
      });
    } else {
      toast({
        title: "Download Started",
        description: `Downloading "${note.title}"...`,
      });
    }
  };

  const handleSubscribe = (plan: string) => {
    setLocation(`/subscribe?plan=${plan}&returnTo=/download-notes`);
    setSubscriptionModalOpen(false);
  };

  const handleStartTrial = () => {
    setUserStatus('trial');
    setTrialDownloads(0);
    localStorage.setItem('userStatus', 'trial');
    localStorage.setItem('trialDownloads', '0');
    toast({
      title: "Trial Started!",
      description: "You now have 3 free downloads. Enjoy exploring our notes!",
    });
    if (selectedNote) {
      handleDirectDownload(selectedNote);
      setTrialDownloads(1);
      localStorage.setItem('trialDownloads', '1');
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

  const getSubjectDisplayName = (sub: string) => sub.replace(/_/g, ' ');

  const getSubjectCount = (subjectName: string) => {
    if (subjectName === 'All') return notes.length;
    return notes.filter(n => n.subject === subjectName || n.subject.replace(/_/g, ' ') === subjectName.replace(/_/g, ' ')).length;
  };

  const getClassCount = (className: string) => {
    if (className === 'All Classes') return notes.length;
    return notes.filter(n => n.classGrade === className).length;
  };

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'popular') return (b.downloadsCount || 0) - (a.downloadsCount || 0);
    if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  });

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
                    Access high-quality study materials — approved by admin, organized by class & subject
                  </p>
                </div>

                {/* Status Badges */}
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

            {/* ── Class Filter Row ─────────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Filter by Class</h2>
                {selectedClass !== 'All Classes' && (
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">{selectedClass}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {CLASS_OPTIONS.map((cls) => (
                  <button
                    key={cls}
                    id={`class-filter-${cls.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      selectedClass === cls
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105'
                        : 'bg-slate-800/60 text-gray-300 border-slate-600 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {cls}
                    <span className="ml-1.5 text-xs opacity-70">({getClassCount(cls)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Search and Sort ──────────────────────────────────────── */}
            <div className="mb-8">
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700">
                <div className="flex flex-col lg:flex-row gap-4 mb-3">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="notes-search-input"
                      placeholder="Search notes, subjects, or topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-4 text-lg bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Sort By */}
                  <select
                    id="notes-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="popular" className="bg-slate-800">Most Downloaded</option>
                    <option value="recent" className="bg-slate-800">Most Recent</option>
                  </select>
                </div>

                <div className="text-gray-400 flex items-center gap-2 text-sm">
                  <Filter className="h-4 w-4" />
                  Showing <span className="text-white font-semibold">{sortedNotes.length}</span> approved notes
                  {selectedClass !== 'All Classes' && <> for <span className="text-cyan-400 font-semibold">{selectedClass}</span></>}
                  {selectedSubject !== 'All' && <> • <span className="text-purple-400 font-semibold">{getSubjectDisplayName(selectedSubject)}</span></>}
                </div>
              </div>
            </div>

            {/* ── Subject Categories ───────────────────────────────────── */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                📚 Browse by Subject
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  Quick Filter
                </Badge>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {/* All button */}
                <button
                  id="subject-filter-all"
                  onClick={() => setSelectedSubject('All')}
                  className={`group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 hover:scale-105 ${
                    selectedSubject === 'All'
                      ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500'
                      : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="relative z-10 text-center">
                    <div className="text-2xl mb-1">🔍</div>
                    <div className="font-bold text-white text-xs">All</div>
                    <div className="text-xs text-gray-400">{notes.length} notes</div>
                  </div>
                </button>

                {SUBJECTS.map((subject, index) => (
                  <button
                    key={subject.name}
                    id={`subject-filter-${subject.name.toLowerCase().replace(/_/g, '-')}`}
                    onClick={() => setSelectedSubject(selectedSubject === subject.name ? 'All' : subject.name)}
                    className={`group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedSubject === subject.name
                        ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500'
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">
                        {subject.icon}
                      </div>
                      <div className="font-bold text-white text-xs mb-0.5 group-hover:text-purple-300 transition-colors">
                        {getSubjectDisplayName(subject.name)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getSubjectCount(subject.name)}
                      </div>
                      {selectedSubject === subject.name && (
                        <div className="absolute top-1.5 right-1.5">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notes Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNotes.length > 0 ? (
                sortedNotes.map((note) => (
                  <Card key={note.id} className="bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50">
                    <CardContent className="p-6">
                      {/* Note Header */}
                      <div className="mb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-bold text-white line-clamp-2 hover:text-purple-400 transition-colors flex-1">
                            {note.title}
                          </h3>
                          {note.attachments && note.attachments.length > 0 && (
                            <FileText className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" title="PDF available" />
                          )}
                        </div>

                        {/* Class + Subject badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {note.classGrade && (
                            <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-xs">
                              🎓 {note.classGrade}
                            </Badge>
                          )}
                          <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-xs">
                            {getSubjectDisplayName(note.subject)}
                          </Badge>
                        </div>
                      </div>

                      {/* Topic */}
                      {note.topic && (
                        <p className="text-gray-400 text-xs mb-2 font-medium">📌 {note.topic}</p>
                      )}

                      {/* Description */}
                      {note.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{note.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-white">{note.downloadsCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-white">{note.viewsCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        {note.price > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            ₹{note.price}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          id={`download-btn-${note.id}`}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl text-sm"
                          onClick={() => handleDownloadClick(note)}
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          {getDownloadButtonText()}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-gray-300 hover:bg-slate-700"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-gray-300 hover:bg-slate-700"
                          title="Like"
                        >
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
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {selectedClass !== 'All Classes' || selectedSubject !== 'All'
                            ? `No notes found for ${selectedClass !== 'All Classes' ? selectedClass : ''} ${selectedSubject !== 'All' ? getSubjectDisplayName(selectedSubject) : ''}`.trim()
                            : 'No Notes Available Yet'}
                        </h3>
                        <p className="text-gray-400 text-lg mb-6">
                          {selectedClass !== 'All Classes' || selectedSubject !== 'All'
                            ? 'Try a different class or subject filter.'
                            : 'Notes appear here after admin approval. Check back soon!'}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {(selectedClass !== 'All Classes' || selectedSubject !== 'All') && (
                          <Button
                            variant="outline"
                            onClick={() => { setSelectedClass('All Classes'); setSelectedSubject('All'); }}
                            className="border-slate-600 text-gray-300 hover:bg-slate-700 mr-3"
                          >
                            Clear Filters
                          </Button>
                        )}

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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Load More */}
            {sortedNotes.length > 0 && total > sortedNotes.length && (
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
                fetchNotes();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
