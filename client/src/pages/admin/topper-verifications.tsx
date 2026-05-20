import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle, XCircle, Clock, User, FileText, ExternalLink,
  Search, Crown, RefreshCw, Eye, AlertCircle, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Verification {
  id: string;
  user_id: string;
  user_email: string;
  exam_name: string;
  subject: string;
  score: string;
  document_url: string;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES = {
  pending:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_ICONS = {
  pending:  <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

export default function TopperVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const adminToken = typeof window !== 'undefined' ? sessionStorage.getItem('adminToken') : null;

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
  };

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/topper-verifications', {
        headers: authHeaders,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not load verifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/topper-verifications/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed');
      }
      toast({
        title: status === 'approved' ? '✅ Approved!' : '❌ Rejected',
        description: status === 'approved'
          ? 'User has been granted Topper status and notified.'
          : 'Application rejected.',
      });
      // Update locally
      setVerifications(prev =>
        prev.map(v => v.id === id ? { ...v, status, updated_at: new Date().toISOString() } : v)
      );
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = verifications.filter(v => {
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchSearch = !search
      || v.user_email.toLowerCase().includes(search.toLowerCase())
      || v.exam_name.toLowerCase().includes(search.toLowerCase())
      || v.subject.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Crown className="h-7 w-7 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Topper Verifications</h1>
            </div>
            <p className="text-slate-400">Review and approve student exam result submissions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchVerifications()}
            disabled={loading}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl p-4 text-left border transition-all ${
                statusFilter === s
                  ? s === 'all'      ? 'bg-blue-500/20 border-blue-400/50'
                  : s === 'pending'  ? 'bg-yellow-500/20 border-yellow-400/50'
                  : s === 'approved' ? 'bg-green-500/20 border-green-400/50'
                                     : 'bg-red-500/20 border-red-400/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className={`text-2xl font-bold mb-0.5 ${
                s === 'pending'  ? 'text-yellow-400' :
                s === 'approved' ? 'text-green-400'  :
                s === 'rejected' ? 'text-red-400'    : 'text-white'
              }`}>{counts[s]}</div>
              <div className="text-xs text-slate-400 capitalize">{s === 'all' ? 'Total' : s}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by email, exam or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-slate-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No verification requests found</p>
              <p className="text-slate-500 text-sm mt-1">Students submit from the /become-topper page</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(v => (
              <Card key={v.id} className="bg-slate-800/70 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`text-xs border flex items-center gap-1 ${STATUS_STYLES[v.status]}`}>
                          {STATUS_ICONS[v.status]}
                          {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                        </Badge>
                        <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-xs">
                          {v.exam_name || 'No exam specified'}
                        </Badge>
                        {v.subject && (
                          <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-xs">
                            {v.subject}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-white text-sm font-medium">{v.user_email}</span>
                      </div>

                      {v.score && (
                        <div className="text-slate-400 text-sm mb-1">
                          Score: <span className="text-white font-semibold">{v.score}</span>
                        </div>
                      )}

                      <div className="text-slate-500 text-xs">
                        Submitted: {new Date(v.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {/* View document */}
                      {v.document_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                          onClick={() => window.open(v.document_url, '_blank')}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Doc
                        </Button>
                      )}

                      {/* Approve */}
                      {v.status !== 'approved' && (
                        <Button
                          size="sm"
                          disabled={actionLoading === v.id}
                          onClick={() => updateStatus(v.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          {actionLoading === v.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve</>
                          )}
                        </Button>
                      )}

                      {/* Reject */}
                      {v.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === v.id}
                          onClick={() => updateStatus(v.id, 'rejected')}
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          {actionLoading === v.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><XCircle className="h-3.5 w-3.5 mr-1.5" />Reject</>
                          )}
                        </Button>
                      )}

                      {/* Already actioned badge */}
                      {v.status === 'approved' && (
                        <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified Topper
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
