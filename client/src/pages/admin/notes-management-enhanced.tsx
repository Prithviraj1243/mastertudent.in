import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Search, Filter, FileText, Clock, AlertCircle, Coins, User, Calendar, Download, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useRealtimeNotes } from '@/hooks/useRealtimeNotes';

interface Note {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  status: string;
  topperId: string;
  uploaderName?: string;
  uploaderEmail?: string;
  attachments: string[];
  createdAt: string;
  downloadsCount: number;
  viewsCount: number;
  price: number;
}

export default function NotesManagementEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // 🚀 REAL-TIME NOTES SUBSCRIPTION (Enhanced)
  const { newNoteNotification, isConnected } = useRealtimeNotes();

  // Show connection status
  useEffect(() => {
    if (isConnected) {
      toast({
        title: "🟢 Real-time Connected",
        description: "You'll see new note uploads instantly",
        duration: 3000,
      });
    }
  }, [isConnected, toast]);

  // Handle new note notifications
  useEffect(() => {
    if (newNoteNotification) {
      console.log('📝 New note notification:', newNoteNotification);
      
      // Show prominent notification
      toast({
        title: "🎉 NEW NOTE UPLOADED!",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{newNoteNotification.title}</p>
            <p className="text-sm text-muted-foreground">Subject: {newNoteNotification.subject}</p>
            <p className="text-xs text-muted-foreground">Status: {newNoteNotification.status}</p>
          </div>
        ),
        duration: 8000,
      });
      
      // Refresh notes list if we're on submitted filter
      if (statusFilter === 'submitted' || statusFilter === 'all') {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/notes'] });
      }
    }
  }, [newNoteNotification, queryClient, toast, statusFilter]);

  // Fetch notes with filters
  const { data: notesData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/notes', statusFilter, searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchQuery,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/admin/notes?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notes');
      }

      return res.json();
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  // Approve note mutation
  const approveMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/admin/notes/${noteId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to approve note');
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Note Approved!",
        description: `Note approved successfully. User awarded ${data.coinsAwarded} coins! 🎉`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setViewDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject note mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ noteId, reason }: { noteId: string; reason: string }) => {
      const res = await fetch(`/api/admin/notes/${noteId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to reject note');
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Note Rejected",
        description: "Note has been rejected and user notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  const handleApprove = (noteId: string) => {
    approveMutation.mutate(noteId);
  };

  const handleReject = () => {
    if (!selectedNote) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ noteId: selectedNote.id, reason: rejectionReason });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { 
        color: 'bg-yellow-100 border-yellow-400 text-black', 
        label: 'Pending Review', 
        icon: Clock 
      },
      approved: { 
        color: 'bg-emerald-100 border-emerald-400 text-black', 
        label: 'Approved', 
        icon: CheckCircle 
      },
      rejected: { 
        color: 'bg-red-100 border-red-400 text-black', 
        label: 'Rejected', 
        icon: XCircle 
      },
      published: { 
        color: 'bg-blue-100 border-blue-400 text-black', 
        label: 'Published', 
        icon: FileText 
      },
      draft: { 
        color: 'bg-gray-100 border-gray-400 text-black', 
        label: 'Draft', 
        icon: FileText 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-black">{config.label}</span>
      </Badge>
    );
  };

  const notes = notesData?.notes || [];
  const total = notesData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="space-y-6 p-6">
          {/* Header - Midnight Blue Theme */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white">
                Notes Management
              </h1>
              <p className="text-gray-300 text-lg font-semibold">
                Review and manage uploaded notes. Approve quality content to reward users with coins.
              </p>
            </div>
            
            {/* Real-time Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg ${
              isConnected 
                ? 'bg-emerald-500/20 border-emerald-400/50 backdrop-blur-sm' 
                : 'bg-gray-500/20 border-gray-400/50 backdrop-blur-sm'
            } transition-all duration-300`}>
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-emerald-300 animate-pulse" />
                  <span className="text-sm font-bold text-white">Real-time Active</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-300">Connecting...</span>
                </>
              )}
            </div>
          </div>

        {/* Stats Cards - Midnight Blue Theme with Bold Black Text */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* Pending Review Card */}
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-2xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold">
                  PENDING
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-black">Pending Review</p>
                <p className="text-4xl font-black text-black">
                  {notes.filter((n: Note) => n.status === 'submitted').length}
                </p>
                <p className="text-xs font-bold text-gray-700">Awaiting approval</p>
              </div>
            </CardContent>
          </Card>

          {/* Approved Card */}
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-2xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">
                  APPROVED
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-black">Approved</p>
                <p className="text-4xl font-black text-black">
                  {notes.filter((n: Note) => n.status === 'approved').length}
                </p>
                <p className="text-xs font-bold text-gray-700">Quality content</p>
              </div>
            </CardContent>
          </Card>

          {/* Rejected Card */}
          <Card className="border-l-4 border-l-red-500 hover:shadow-2xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300 font-bold">
                  REJECTED
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-black">Rejected</p>
                <p className="text-4xl font-black text-black">
                  {notes.filter((n: Note) => n.status === 'rejected').length}
                </p>
                <p className="text-xs font-bold text-gray-700">Needs improvement</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Notes Card */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold">
                  TOTAL
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-black">Total Notes</p>
                <p className="text-4xl font-black text-black">{total}</p>
                <p className="text-xs font-bold text-gray-700">All submissions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - White Card with Bold Black Text */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-black text-black">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-5 w-5" />
                  <Input
                    placeholder="Search notes by title, subject, or uploader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 font-semibold text-black placeholder:text-gray-500 border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[220px] h-12 font-bold text-black border-2 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="font-bold">All Status</SelectItem>
                  <SelectItem value="submitted" className="font-bold">Pending Review</SelectItem>
                  <SelectItem value="approved" className="font-bold">Approved</SelectItem>
                  <SelectItem value="rejected" className="font-bold">Rejected</SelectItem>
                  <SelectItem value="published" className="font-bold">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notes List - White Card with Bold Black Text */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-black">Notes List</CardTitle>
            <CardDescription className="font-bold text-gray-700">
              {total} total notes • Page {page} of {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-bold">Failed to load notes. Please try again.</AlertDescription>
              </Alert>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-12 w-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-black text-black">No notes found</h3>
                <p className="text-gray-700 font-bold mt-2">
                  {statusFilter === 'submitted'
                    ? 'No notes pending review at the moment.'
                    : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {notes.map((note: Note) => (
                    <div 
                      key={note.id}
                      className="group border-2 border-gray-300 rounded-xl p-5 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Title & Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-xl font-black text-black mb-1">
                              {note.title}
                            </h4>
                            <p className="text-sm font-bold text-gray-700">
                              {note.subject} • {note.topic}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            {/* Uploader */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border-2 border-gray-300">
                              <User className="h-4 w-4 text-gray-700" />
                              <div>
                                <div className="text-xs font-bold text-black">{note.uploaderName || 'Unknown'}</div>
                                <div className="text-xs font-bold text-gray-600">{note.uploaderEmail}</div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {getStatusBadge(note.status)}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 rounded-lg border border-blue-300">
                                <Download className="h-4 w-4 text-blue-700" />
                                <span className="text-black font-black">{note.downloadsCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 rounded-lg border border-purple-300">
                                <Eye className="h-4 w-4 text-purple-700" />
                                <span className="text-black font-black">{note.viewsCount}</span>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-1.5 text-sm font-bold text-black">
                              <Calendar className="h-4 w-4" />
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewNote(note)}
                            className="border-2 border-blue-400 text-black font-bold hover:bg-blue-50 hover:border-blue-600"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                          {note.status === 'submitted' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(note.id)}
                              disabled={approveMutation.isPending}
                              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold shadow-lg"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-300">
                  <div className="text-sm font-bold text-black">
                    Showing <span className="text-black font-black">{(page - 1) * limit + 1}</span> to <span className="text-black font-black">{Math.min(page * limit, total)}</span> of <span className="text-black font-black">{total}</span> notes
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-2 border-gray-400 font-bold text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-2 border-gray-400 font-bold text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View Note Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Review Note</DialogTitle>
              <DialogDescription>
                Review the note details and decide to approve or reject.
              </DialogDescription>
            </DialogHeader>
            {selectedNote && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNote.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedNote.subject} • {selectedNote.topic}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Uploader</label>
                    <p className="text-sm">{selectedNote.uploaderName || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedNote.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <p className="text-sm flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {selectedNote.price} coins
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Uploaded</label>
                    <p className="text-sm">{new Date(selectedNote.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedNote.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Attachments</label>
                  <div className="mt-2 space-y-2">
                    {selectedNote.attachments && selectedNote.attachments.length > 0 ? (
                      selectedNote.attachments.map((attachment: string, index: number) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View attachment {index + 1}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No attachments</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              {selectedNote?.status === 'submitted' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectDialogOpen(true);
                      setViewDialogOpen(false);
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => selectedNote && handleApprove(selectedNote.id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve & Award 20 Coins
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Note Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Note</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this note. The uploader will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setViewDialogOpen(true);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </AdminLayout>
  );
}
