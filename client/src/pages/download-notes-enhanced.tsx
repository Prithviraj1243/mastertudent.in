import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  Download,
  Eye,
  Calendar,
  Crown,
  Zap,
  GraduationCap,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import SubscriptionModal from "@/components/subscription-modal";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
import { useToast } from "@/hooks/use-toast";
import PageWrapper from "@/components/layout/page-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotes } from "@/hooks/useRealtimeNotes";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  description?: string;
  downloads: number;
  views: number;
  price: number;
  classGrade?: string;
  attachments?: string[];
  createdAt: string;
  isDemo?: boolean;
}

/* ─── Demo note shown when DB is empty ──────────────────────────────────── */
const DEMO_NOTE: Note = {
  id: 'demo-bio-1',
  title: 'Biology – Chapter 1: The Living World',
  subject: 'Biology',
  topic: 'Chapter 1',
  description:
    'Complete notes on what defines a living organism, taxonomy, nomenclature, and classification. Includes NCERT diagrams, key terms, and MCQ practice questions for NEET.',
  downloads: 128,
  views: 340,
  price: 0,
  classGrade: 'Class 11',
  attachments: [],
  createdAt: new Date().toISOString(),
  isDemo: true,
};

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CLASSES = [
  'All Classes', 'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12',
  'Undergraduate', 'Postgraduate',
];

const SUBJECTS = [
  { name: 'All', icon: '🔍' },
  { name: 'Mathematics', icon: '📐' },
  { name: 'Physics', icon: '⚛️' },
  { name: 'Chemistry', icon: '🧪' },
  { name: 'Biology', icon: '🧬' },
  { name: 'Computer Science', icon: '💻' },
  { name: 'English', icon: '📚' },
  { name: 'History', icon: '📜' },
  { name: 'Geography', icon: '🗺️' },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function DownloadNotesEnhanced() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [dodoPaymentOpen, setDodoPaymentOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);

  // Check subscription from localStorage (set after payment success)
  const [isPremium, setIsPremium] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('userStatus') === 'premium'
  );

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Realtime hook — triggers refetch on note changes
  const { isConnected, newNoteNotification } = useRealtimeNotes();

  /* ── Handle payment return ────────────────────────────────────────── */
  useEffect(() => {
    const returnUrl = localStorage.getItem('payment_return_url');
    const paymentPlan = localStorage.getItem('payment_plan');
    if (returnUrl && window.location.href.includes('/download-notes')) {
      localStorage.removeItem('payment_return_url');
      localStorage.removeItem('payment_plan');
      localStorage.setItem('userStatus', 'premium');
      setIsPremium(true);
      toast({
        title: '🎉 Subscription Active!',
        description: `Your ${paymentPlan || 'premium'} plan is now active. Download all notes for free!`,
        duration: 6000,
      });
    }
  }, []);

  /* ── Fetch notes from API ─────────────────────────────────────────── */
  const fetchNotes = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.set('subject', selectedSubject.replace(/ /g, '_'));
      if (selectedClass !== 'All Classes') params.set('classGrade', selectedClass);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      params.set('limit', '60');

      const res = await fetch(`/api/notes?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const mapped: Note[] = (data.notes || []).map((n: any) => ({
        id: n.id,
        title: n.title || 'Untitled',
        subject: (n.subject || 'General').replace(/_/g, ' '),
        topic: n.topic || undefined,
        description: n.description || undefined,
        downloads: n.downloadsCount || 0,
        views: n.viewsCount || 0,
        price: n.price || 0,
        classGrade: n.classGrade || undefined,
        attachments: n.attachments || [],
        createdAt: n.createdAt || new Date().toISOString(),
      }));

      setNotes(mapped);
      setTotal(data.total || mapped.length);
    } catch (err) {
      console.error('fetchNotes error:', err);
      toast({ title: 'Error', description: 'Could not load notes. Please refresh.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSubject, selectedClass, searchTerm]);

  // Initial + filter-change fetch
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Realtime: re-fetch when a note is updated/approved
  useEffect(() => {
    if (newNoteNotification) {
      fetchNotes(true);
      toast({
        title: '📡 New Note Available!',
        description: `"${newNoteNotification.title}" just got published.`,
      });
    }
  }, [newNoteNotification]);

  /* ── Decide which notes to show ───────────────────────────────────── */
  const displayNotes: Note[] =
    notes.length > 0
      ? notes
      : !loading
        ? [DEMO_NOTE]  // show demo if DB is empty
        : [];

  /* ── Download handler ─────────────────────────────────────────────── */
  const handleDownload = (note: Note) => {
    if (note.isDemo) {
      toast({ title: 'Demo Note', description: 'Upload real notes via the admin panel to enable downloads.' });
      return;
    }

    // Any logged-in user OR premium → direct free download
    // (price is only charged to completely anonymous visitors)
    const canDownloadFree = isPremium || !!user || note.price === 0;

    if (canDownloadFree) {
      if (note.attachments && note.attachments.length > 0) {
        window.open(note.attachments[0], '_blank');
        toast({ title: '✅ Download Started', description: `Opening "${note.title}"` });
      } else {
        toast({ title: 'No File Attached', description: 'The admin hasn\'t attached a PDF yet.', variant: 'destructive' });
      }
      return;
    }

    // Anonymous visitor with paid note → subscription prompt
    setSelectedNote(note);
    setSubscriptionModalOpen(true);
  };

  /* ── View handler ─────────────────────────────────────────────────── */
  const handleView = (note: Note) => {
    if (note.isDemo) {
      toast({ title: 'Demo Note', description: 'This is a sample note. Upload real content from the admin panel.' });
      return;
    }
    if (note.attachments && note.attachments.length > 0) {
      window.open(note.attachments[0], '_blank');
    } else {
      setViewNote(note);
    }
  };

  const getSubjectCount = (sub: string) => {
    if (sub === 'All') return displayNotes.length;
    return displayNotes.filter(n => n.subject === sub || n.subject.replace(/ /g, '_') === sub.replace(/ /g, '_')).length;
  };

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <PageWrapper
      title="Download Notes"
      subtitle="Browse approved study materials"
      icon={<BookOpen className="h-6 w-6 text-white" />}
    >
      <div className="space-y-6">

        {/* ── Top Bar: status + realtime indicator ───────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Premium badge */}
          {isPremium ? (
            <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 rounded-xl px-4 py-2">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-semibold">Premium — Unlimited Free Downloads</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/40 rounded-xl px-4 py-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                Free account — <button onClick={() => setSubscriptionModalOpen(true)} className="text-purple-400 underline underline-offset-2">Upgrade for unlimited downloads</button>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Realtime indicator */}
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${isConnected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-700/50 border-slate-600/30 text-gray-500'}`}>
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? 'Live' : 'Offline'}
            </div>
            {/* Refresh */}
            <button
              onClick={() => fetchNotes(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Search ────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400/70" />
          <Input
            id="notes-search"
            placeholder="Search notes by title, subject or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-slate-800/70 border-blue-500/20 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/10"
          />
        </div>

        {/* ── Class filter pills ────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-300">Filter by Class</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((cls) => (
              <button
                key={cls}
                id={`class-filter-${cls.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  selectedClass === cls
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* ── Subject chips ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-slate-300">Filter by Subject</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.name}
                id={`subject-filter-${s.name.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setSelectedSubject(s.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  selectedSubject === s.name
                    ? 'bg-purple-500/20 border-purple-400/60 text-purple-300'
                    : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:border-purple-500/30 hover:text-slate-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
                <span className="opacity-60">({getSubjectCount(s.name)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing <span className="text-white font-semibold">{displayNotes.length}</span> notes
            {notes.length === 0 && !loading && <span className="text-amber-400 ml-2">(Demo — upload real notes via admin panel)</span>}
          </span>
          {(selectedClass !== 'All Classes' || selectedSubject !== 'All') && (
            <button
              onClick={() => { setSelectedClass('All Classes'); setSelectedSubject('All'); setSearchTerm(''); }}
              className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Notes grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
              <p className="text-slate-400 text-sm">Loading notes...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayNotes.map((note) => (
              <Card
                key={note.id}
                className={`bg-gradient-to-br from-slate-800 to-slate-900 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group ${
                  note.isDemo
                    ? 'border-amber-500/30 hover:border-amber-400/50'
                    : 'border-blue-500/20 hover:border-blue-400/40'
                }`}
              >
                <CardContent className="p-5">
                  {/* Demo badge */}
                  {note.isDemo && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      Sample Note — Upload real notes to replace this
                    </div>
                  )}

                  {/* Class + Subject badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.classGrade && (
                      <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-xs px-2 py-0.5">
                        🎓 {note.classGrade}
                      </Badge>
                    )}
                    <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/25 text-xs px-2 py-0.5">
                      {note.subject}
                    </Badge>
                    <Badge className="bg-green-500/15 text-green-300 border-green-500/25 text-xs px-2 py-0.5">
                      FREE
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-base mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {note.title}
                  </h3>

                  {/* Topic */}
                  {note.topic && (
                    <p className="text-slate-500 text-xs mb-2 font-medium">📌 {note.topic}</p>
                  )}

                  {/* Description */}
                  {note.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{note.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-blue-400" />
                      <span className="text-slate-300">{note.downloads}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-green-400" />
                      <span className="text-slate-300">{note.views}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      id={`download-${note.id}`}
                      size="sm"
                      onClick={() => handleDownload(note)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                    <Button
                      id={`view-${note.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(note)}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Upload CTA ────────────────────────────────────────────── */}
        {!loading && notes.length === 0 && (
          <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
            <h4 className="text-purple-300 font-semibold mb-1">Want to contribute?</h4>
            <p className="text-slate-400 text-sm mb-4">Upload study notes and earn coins after admin approval!</p>
            <Link href="/upload-notes">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
                Upload Notes → Earn 20 Coins
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Subscription Modal ──────────────────────────────────────── */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscribe={(plan) => {
          localStorage.setItem('userStatus', 'premium');
          localStorage.setItem('payment_plan', plan);
          localStorage.setItem('payment_return_url', window.location.href);
          setIsPremium(true);
          setSubscriptionModalOpen(false);
          toast({ title: '🎉 Premium Activated!', description: 'You can now download all notes for free.' });
        }}
        onStartTrial={() => {
          localStorage.setItem('userStatus', 'trial');
          setSubscriptionModalOpen(false);
          toast({ title: 'Trial Started!', description: 'You have 3 free downloads.' });
        }}
        noteTitle={selectedNote?.title || ''}
      />

      {/* ── Dodo Payment Modal ──────────────────────────────────────── */}
      {selectedNote && (
        <Dialog open={dodoPaymentOpen} onOpenChange={setDodoPaymentOpen}>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white p-0 border-0 rounded-2xl shadow-2xl">
            <DodoPaymentGateway
              noteId={selectedNote.id}
              noteTitle={selectedNote.title}
              notePrice={selectedNote.price}
              onBack={() => setDodoPaymentOpen(false)}
              onSuccess={() => {
                setDodoPaymentOpen(false);
                handleDownload(selectedNote);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ── View Note Modal (when no PDF) ───────────────────────────── */}
      {viewNote && (
        <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
          <DialogContent className="max-w-lg bg-slate-900 border border-slate-700 text-white rounded-2xl">
            <div className="p-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {viewNote.classGrade && (
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-xs">🎓 {viewNote.classGrade}</Badge>
                )}
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/25 text-xs">{viewNote.subject}</Badge>
              </div>
              <h2 className="text-xl font-bold mb-2">{viewNote.title}</h2>
              {viewNote.topic && <p className="text-slate-400 text-sm mb-3">📌 {viewNote.topic}</p>}
              {viewNote.description && <p className="text-slate-300 text-sm mb-4">{viewNote.description}</p>}
              <p className="text-slate-500 text-xs">No PDF is attached yet. Once the admin attaches a file, you can download it.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
