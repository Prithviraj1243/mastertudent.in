import { useState, useEffect } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload, FileText, CheckCircle, Clock, XCircle,
  Eye, Download, Coins, TrendingUp, BookOpen, Calendar,
  RefreshCw, ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  title: string;
  subject: string;
  status: string;
  attachments: string[] | null;
  fileUrl: string | null;
  views_count: number;
  downloads_count: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  approved: {
    label: 'Approved',
    color: 'text-green-300 border-green-500/40',
    bg: 'bg-green-500/15',
    icon: CheckCircle,
  },
  submitted: {
    label: 'Under Review',
    color: 'text-yellow-300 border-yellow-500/40',
    bg: 'bg-yellow-500/15',
    icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-300 border-red-500/40',
    bg: 'bg-red-500/15',
    icon: XCircle,
  },
};

export default function MyUploads() {
  const { stats } = useUserStats();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      // Get current Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      // Build auth headers — send BOTH the JWT and the x-user-id
      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers['x-supabase-token'] = session.access_token;
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Prefer internal DB id from sessionStorage, fallback to Supabase auth sub
      let internalId: string = '';
      try {
        const raw = sessionStorage.getItem('authUser');
        internalId = raw ? (JSON.parse(raw)?.id || '') : '';
      } catch { /* ignore */ }

      if (!internalId) {
        try {
          const raw = localStorage.getItem('authUser');
          internalId = raw ? (JSON.parse(raw)?.id || '') : '';
        } catch { /* ignore */ }
      }

      // Fallback to supabase sub (server will resolve)
      if (!internalId && session?.user?.id) internalId = session.user.id;

      if (internalId) headers['x-user-id'] = internalId;

      console.log('🔍 loadNotes: userId =', internalId, '| token present:', !!session?.access_token);

      const res = await fetch('/api/user/notes', {
        credentials: 'include',
        headers,
      });

      console.log('📥 /api/user/notes status:', res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error('Notes fetch failed:', text);
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data: Note[] = await res.json();
      console.log('✅ Notes loaded:', data.length);
      setNotes(data);
    } catch (e: any) {
      console.error('loadNotes error:', e);
      setError(e.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const approved = notes.filter(n => n.status === 'approved');
  const pending  = notes.filter(n => n.status === 'submitted');
  const coinBal  = stats.coinBalance ?? (approved.length * 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* File Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-slate-900 border border-slate-600 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <span className="text-white font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" /> Document Preview
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" asChild>
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" /> Open in Tab
                  </a>
                </Button>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setPreviewUrl(null)}>
                  ✕ Close
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[75vh] bg-white"
                  title="PDF Preview"
                />
              ) : previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[75vh] object-contain mx-auto block" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText className="h-16 w-16 mb-4 text-slate-600" />
                  <p>Preview not available for this file type</p>
                  <Button className="mt-4" asChild>
                    <a href={previewUrl} target="_blank" rel="noreferrer">Open File</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                My Uploads
              </h1>
              <p className="text-slate-400 mt-1 ml-1">All your uploaded notes, status &amp; coin earnings</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNotes}
              disabled={loading}
              className="text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Uploads',  value: loading ? '—' : notes.length,    icon: FileText,    grad: 'from-blue-500 to-cyan-500',     border: 'border-blue-500/30' },
              { label: 'Approved',       value: loading ? '—' : approved.length, icon: CheckCircle, grad: 'from-green-500 to-emerald-500',  border: 'border-green-500/30' },
              { label: 'Under Review',   value: loading ? '—' : pending.length,  icon: Clock,       grad: 'from-yellow-500 to-orange-500',  border: 'border-yellow-500/30' },
              { label: 'Coin Balance',   value: `${coinBal} 🪙`,                 icon: Coins,       grad: 'from-amber-500 to-yellow-500',   border: 'border-amber-500/30' },
            ].map(s => (
              <Card key={s.label} className={`bg-slate-800/60 backdrop-blur-md border ${s.border} shadow-xl hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${s.grad} p-3 rounded-xl shadow-md`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Earnings Banner */}
          {!loading && approved.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-green-500/15 border border-yellow-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg">
                    🎉 {approved.length} note{approved.length > 1 ? 's' : ''} approved!
                  </div>
                  <div className="text-slate-300 text-sm">
                    {approved.length} × 20 coins = <span className="text-yellow-300 font-bold">{approved.length * 20} coins</span>
                    &nbsp;·&nbsp; 20 coins = ₹1
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/70 border border-green-500/20 rounded-xl px-6 py-3 text-right">
                <div className="text-xs text-slate-400 mb-1">Coin Balance</div>
                <div className="text-2xl font-bold text-yellow-300">{coinBal} coins</div>
                <div className="text-green-400 font-bold">₹{(coinBal / 20).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
              ⚠️ {error} — <button onClick={loadNotes} className="underline">Try again</button>
            </div>
          )}

          {/* Notes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-slate-800/60 border border-slate-600/50 animate-pulse">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="h-11 w-11 bg-slate-600/50 rounded-xl" />
                      <div className="h-6 w-28 bg-slate-600/50 rounded-full" />
                    </div>
                    <div className="h-5 bg-slate-600/50 rounded w-4/5" />
                    <div className="h-4 bg-slate-600/50 rounded w-1/2" />
                    <div className="h-10 bg-slate-600/50 rounded-lg" />
                    <div className="flex gap-2">
                      <div className="h-9 bg-slate-600/50 rounded-lg flex-1" />
                      <div className="h-9 bg-slate-600/50 rounded-lg flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl p-12 border border-slate-600/50 text-center max-w-md shadow-2xl">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl w-fit mx-auto mb-5 shadow-lg">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No uploads yet</h2>
                <p className="text-slate-400 mb-2">Upload notes &amp; earn <span className="text-yellow-300 font-bold">20 coins</span> on approval</p>
                <p className="text-slate-500 text-sm mb-7">20 coins = ₹1 · Withdraw anytime</p>
                <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-8 py-3 shadow-xl">
                  <Link href="/upload">
                    <Upload className="mr-2 h-4 w-4" /> Upload Notes Now
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {notes.map(note => {
                  const cfg = STATUS_CONFIG[note.status] ?? STATUS_CONFIG['submitted'];
                  const StatusIcon = cfg.icon;
                  const fileUrl = note.fileUrl
                    ?? (Array.isArray(note.attachments) && note.attachments.length > 0 ? note.attachments[0] : null);
                  const date = note.created_at
                    ? new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <Card key={note.id} className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50 hover:border-purple-500/40 shadow-xl hover:shadow-purple-900/20 hover:shadow-2xl transition-all duration-300 group flex flex-col">
                      <CardContent className="p-5 flex flex-col flex-1">

                        {/* Card top row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2.5 rounded-xl shadow-md ${
                            note.status === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                            note.status === 'rejected' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                            'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}>
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <Badge className={`text-xs border ${cfg.color} ${cfg.bg} flex items-center gap-1 font-medium px-2.5 py-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-white text-base mb-2 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                          {note.title}
                        </h3>

                        {/* Subject + Date */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {note.subject && (
                            <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">
                              📚 {note.subject}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {date}
                          </span>
                        </div>

                        {/* Status pill */}
                        <div className={`text-xs font-medium px-3 py-2 rounded-lg mb-4 flex items-center gap-2 border ${
                          note.status === 'approved'
                            ? 'bg-green-500/10 text-green-300 border-green-500/20'
                            : note.status === 'rejected'
                            ? 'bg-red-500/10 text-red-300 border-red-500/20'
                            : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                        }`}>
                          {note.status === 'approved' ? (
                            <><Coins className="h-3.5 w-3.5 flex-shrink-0" /> +20 coins awarded · ₹1.00 earned</>
                          ) : note.status === 'rejected' ? (
                            <><XCircle className="h-3.5 w-3.5 flex-shrink-0" /> Not approved — re-upload</>
                          ) : (
                            <><Clock className="h-3.5 w-3.5 flex-shrink-0" /> Awaiting review · coins pending</>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-xs text-slate-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {note.views_count || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" /> {note.downloads_count || 0} downloads
                          </span>
                        </div>

                        {/* File actions */}
                        <div className="mt-auto">
                          {fileUrl ? (
                            <div className="space-y-2">
                              {/* Preview button — opens inline modal */}
                              <Button
                                size="sm"
                                className="w-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-medium text-xs"
                                onClick={() => setPreviewUrl(fileUrl)}
                              >
                                <Eye className="mr-2 h-3.5 w-3.5" /> View Document
                              </Button>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-indigo-600/25 hover:bg-indigo-600/45 text-indigo-300 border border-indigo-500/25 text-xs"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                >
                                  <ExternalLink className="mr-1.5 h-3 w-3" /> Open
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600/25 hover:bg-green-600/45 text-green-300 border border-green-500/25 text-xs"
                                  asChild
                                >
                                  <a href={fileUrl} download target="_blank" rel="noreferrer">
                                    <Download className="mr-1.5 h-3 w-3" /> Download
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-slate-600 py-3 border border-dashed border-slate-700 rounded-xl">
                              No file attached
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-10 text-center">
                <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-10 py-3 text-base font-bold shadow-xl rounded-2xl">
                  <Link href="/upload">
                    <Upload className="mr-2 h-5 w-5" /> Upload More &amp; Earn
                  </Link>
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
