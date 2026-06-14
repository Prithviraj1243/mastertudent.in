import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  GraduationCap,
  FileText,
  RefreshCw,
  Lock,
  Sparkles,
  Filter,
  X,
} from 'lucide-react';
import { Link, useLocation } from "wouter";
import SubscriptionModal from "@/components/subscription-modal";
import DodoPaymentGateway from "@/components/dodo-payment-gateway";
import { useToast } from "@/hooks/use-toast";
import PageWrapper from "@/components/layout/page-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotes } from "@/hooks/useRealtimeNotes";

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
}

const CLASSES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] as const;

const SUBJECTS = [
  { name: 'Mathematics', icon: '📐', color: 'from-blue-500 to-cyan-500', ring: 'ring-blue-400/50', bg: 'bg-blue-500/10', text: 'text-blue-300' },
  { name: 'Physics', icon: '⚛️', color: 'from-violet-500 to-purple-500', ring: 'ring-violet-400/50', bg: 'bg-violet-500/10', text: 'text-violet-300' },
  { name: 'Chemistry', icon: '🧪', color: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-400/50', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  { name: 'Biology', icon: '🧬', color: 'from-rose-500 to-orange-500', ring: 'ring-rose-400/50', bg: 'bg-rose-500/10', text: 'text-rose-300' },
] as const;

function getSubjectStyle(subject: string) {
  return SUBJECTS.find((s) => s.name === subject) ?? {
    name: subject,
    icon: '📘',
    color: 'from-slate-500 to-slate-600',
    ring: 'ring-slate-400/50',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
  };
}

function extractChapterNum(note: Note): number {
  const fromTitle = note.title.match(/Chapter\s*(\d+)/i);
  if (fromTitle) return parseInt(fromTitle[1], 10);
  const fromTopic = note.topic?.match(/Chapter\s*(\d+)/i);
  if (fromTopic) return parseInt(fromTopic[1], 10);
  return 999;
}

function displayTitle(note: Note): string {
  const stripped = note.title.replace(/^Class\s+\d+\s+\w+\s*-\s*/i, '');
  return stripped || note.title;
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const subj = a.subject.localeCompare(b.subject);
    if (subj !== 0) return subj;
    return extractChapterNum(a) - extractChapterNum(b);
  });
}

export default function DownloadNotesEnhanced() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Class 11');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [dodoPaymentOpen, setDodoPaymentOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);

  const [isPremium, setIsPremium] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('userStatus') === 'premium',
  );

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { newNoteNotification } = useRealtimeNotes();

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
  }, [toast]);

  const fetchNotes = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (selectedSubject !== 'All') params.set('subject', selectedSubject.replace(/ /g, '_'));
      if (selectedClass) params.set('classGrade', selectedClass);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      params.set('limit', '200');

      const res = await fetch(`/api/notes?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      const mapped: Note[] = (data.notes || []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        title: (n.title as string) || 'Untitled',
        subject: ((n.subject as string) || 'General').replace(/_/g, ' '),
        topic: n.topic as string | undefined,
        description: n.description as string | undefined,
        downloads: (n.downloadsCount as number) || 0,
        views: (n.viewsCount as number) || 0,
        price: (n.price as number) || 0,
        classGrade: n.classGrade as string | undefined,
        attachments: (n.attachments as string[]) || [],
        createdAt: (n.createdAt as string) || new Date().toISOString(),
      }));

      setNotes(mapped);
      setTotal((data.total as number) || mapped.length);
    } catch (err) {
      console.error('fetchNotes error:', err);
      toast({ title: 'Error', description: 'Could not load notes. Please refresh.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSubject, selectedClass, searchTerm, toast]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  useEffect(() => {
    if (newNoteNotification) {
      fetchNotes(true);
      toast({
        title: '📡 New Note Available!',
        description: `"${newNoteNotification.title}" just got published.`,
      });
    }
  }, [newNoteNotification, fetchNotes, toast]);

  const sortedNotes = useMemo(() => sortNotes(notes), [notes]);

  const groupedNotes = useMemo(() => {
    if (selectedSubject !== 'All') return null;
    const groups: Record<string, Note[]> = {};
    for (const note of sortedNotes) {
      if (!groups[note.subject]) groups[note.subject] = [];
      groups[note.subject].push(note);
    }
    const order = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
    return order
      .filter((s) => groups[s]?.length)
      .map((s) => ({ subject: s, notes: groups[s] }))
      .concat(
        Object.keys(groups)
          .filter((s) => !order.includes(s))
          .sort()
          .map((s) => ({ subject: s, notes: groups[s] })),
      );
  }, [sortedNotes, selectedSubject]);

  const handleDownload = (note: Note) => {
    const canDownloadFree = isPremium || !!user || note.price === 0;
    if (canDownloadFree) {
      if (note.attachments && note.attachments.length > 0) {
        window.open(note.attachments[0], '_blank');
        toast({ title: '✅ Download Started', description: `Opening "${displayTitle(note)}"` });
      } else {
        toast({ title: 'No File Attached', description: 'PDF not available for this note yet.', variant: 'destructive' });
      }
      return;
    }
    setSelectedNote(note);
    setSubscriptionModalOpen(true);
  };

  const handleView = (note: Note) => {
    if (note.attachments && note.attachments.length > 0) {
      window.open(note.attachments[0], '_blank');
    } else {
      setViewNote(note);
    }
  };

  const clearFilters = () => {
    setSelectedClass('Class 11');
    setSelectedSubject('All');
    setSearchTerm('');
  };

  const hasActiveSearch = searchTerm.trim().length > 0;

  const renderNoteCard = (note: Note) => {
    const style = getSubjectStyle(note.subject);
    const chapterNum = extractChapterNum(note);
    const chapterLabel = chapterNum < 999 ? `Ch. ${chapterNum}` : null;

    return (
      <Card
        key={note.id}
        className={`group relative overflow-hidden bg-slate-900/80 border border-slate-700/50 hover:border-slate-500/60 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${style.color}`} />
        <CardContent className="p-5 pl-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {chapterLabel && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${style.bg} ${style.text} border border-white/5`}>
                  {chapterLabel}
                </span>
              )}
              <Badge variant="outline" className={`text-xs border-0 ${style.bg} ${style.text}`}>
                {style.icon} {note.subject}
              </Badge>
            </div>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-[10px] shrink-0">
              FREE
            </Badge>
          </div>

          <h3 className="text-white font-semibold text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
            {displayTitle(note)}
          </h3>

          {note.description && (
            <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{note.description}</p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {note.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {note.views}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> PDF
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleDownload(note)}
              className={`flex-1 text-xs font-semibold bg-gradient-to-r ${style.color} hover:opacity-90 text-white border-0 shadow-md`}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleView(note)}
              className="border-slate-600/60 text-slate-300 hover:bg-slate-800 hover:text-white text-xs px-3"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageWrapper
      title="Download Notes"
      subtitle="NCERT chapter-wise notes for Classes 8–12"
      icon={<BookOpen className="h-6 w-6 text-white" />}
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Premium bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isPremium ? (
            <div className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-xl px-4 py-2.5">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-purple-200 text-sm font-medium">Premium — Unlimited downloads</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/30 rounded-xl px-4 py-2.5">
              <Lock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400 text-sm">
                Logged-in users download free ·{' '}
                <button type="button" onClick={() => setSubscriptionModalOpen(true)} className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                  Upgrade
                </button>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fetchNotes(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter panel */}
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Filter className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-sm">Find your notes</span>
            </div>

            {/* Step 1: Class */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">1</span>
                Select Class
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      selectedClass === cls
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                        : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className={`h-4 w-4 mx-auto mb-1 ${selectedClass === cls ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {cls.replace('Class ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Subject */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">2</span>
                Select Subject
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubject('All')}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 flex flex-col items-center gap-1 ${
                    selectedSubject === 'All'
                      ? 'bg-slate-700/80 border-slate-400/50 text-white ring-2 ring-slate-400/30'
                      : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:border-slate-500/50'
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                  All Subjects
                </button>
                {SUBJECTS.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSubject(s.name)}
                    className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 flex flex-col items-center gap-1 ${
                      selectedSubject === s.name
                        ? `${s.bg} border-white/20 ${s.text} ring-2 ${s.ring} scale-[1.02]`
                        : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:border-slate-500/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative pt-2 border-t border-slate-700/50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 mt-3" />
              <Input
                placeholder="Search by chapter name or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 mt-3 bg-slate-800/70 border-slate-600/40 text-white placeholder:text-slate-500 focus:border-cyan-500/40 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active selection summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-sm">Showing</span>
            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25">{selectedClass}</Badge>
            {selectedSubject !== 'All' && (
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/25">{selectedSubject}</Badge>
            )}
            <span className="text-white font-semibold text-sm">
              · {loading ? '…' : `${total} note${total !== 1 ? 's' : ''}`}
            </span>
          </div>
          {(hasActiveSearch || selectedSubject !== 'All' || selectedClass !== 'Class 11') && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reset filters
            </button>
          )}
        </div>

        {/* Notes */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-600 border-t-cyan-400" />
              <p className="text-slate-400 text-sm">Loading {selectedClass} notes…</p>
            </div>
          </div>
        ) : sortedNotes.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50 border-dashed">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No notes found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                No notes match {selectedClass}
                {selectedSubject !== 'All' ? ` · ${selectedSubject}` : ''}
                {hasActiveSearch ? ` · "${searchTerm}"` : ''}. Try another class or subject.
              </p>
              <Button variant="outline" onClick={clearFilters} className="border-slate-600 text-slate-300">
                Reset to Class 11 · All Subjects
              </Button>
            </CardContent>
          </Card>
        ) : groupedNotes ? (
          <div className="space-y-10">
            {groupedNotes.map(({ subject, notes: groupNotes }) => {
              const style = getSubjectStyle(subject);
              return (
                <section key={subject}>
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-700/50">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-lg shadow-lg`}>
                      {style.icon}
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">{subject}</h2>
                      <p className="text-slate-500 text-xs">{groupNotes.length} chapters · {selectedClass}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {groupNotes.map(renderNoteCard)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedNotes.map(renderNoteCard)}
          </div>
        )}

        {/* Upload CTA */}
        {!loading && sortedNotes.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Have notes to share?
              </h4>
              <p className="text-slate-400 text-sm mt-1">Upload your study materials and earn coins after approval.</p>
            </div>
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shrink-0">
                Upload Notes
              </Button>
            </Link>
          </div>
        )}
      </div>

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

      {viewNote && (
        <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
          <DialogContent className="max-w-lg bg-slate-900 border border-slate-700 text-white rounded-2xl">
            <div className="p-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {viewNote.classGrade && (
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-xs">{viewNote.classGrade}</Badge>
                )}
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/25 text-xs">{viewNote.subject}</Badge>
              </div>
              <h2 className="text-xl font-bold mb-2">{displayTitle(viewNote)}</h2>
              {viewNote.topic && <p className="text-slate-400 text-sm mb-3">{viewNote.topic}</p>}
              {viewNote.description && <p className="text-slate-300 text-sm mb-4">{viewNote.description}</p>}
              <p className="text-slate-500 text-xs">PDF not attached yet for this note.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
