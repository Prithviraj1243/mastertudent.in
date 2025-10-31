import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, Eye, Download, Star, CheckCircle, XCircle, Clock, User, Calendar, FileText, Filter } from "lucide-react";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  status: string;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  downloadsCount: number;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  publishedAt?: string;
  attachments: string[];
}

export function NotesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: notesData, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/notes", { status: statusFilter, subject: subjectFilter }],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: (noteId: string) => apiRequest(`/api/review/${noteId}/approve`, "PUT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      toast({ title: "Note approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve note", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ noteId, reason }: { noteId: string; reason: string }) => 
      apiRequest(`/api/review/${noteId}/reject`, "PUT", { comments: [reason] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      toast({ title: "Note rejected successfully" });
      setRejectionReason("");
      setSelectedNote(null);
    },
    onError: () => {
      toast({ title: "Failed to reject note", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Published
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Physics': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-green-100 text-green-800',
      'Biology': 'bg-yellow-100 text-yellow-800',
      'Computer_Science': 'bg-indigo-100 text-indigo-800',
      'English': 'bg-pink-100 text-pink-800',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotes = notesData?.notes?.filter((note: Note) => {
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Notes Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="submitted">Pending Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="Computer_Science">Computer Science</SelectItem>
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search notes, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />

          {(statusFilter || subjectFilter || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setSubjectFilter("");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notes found matching your criteria</p>
            </div>
          ) : (
            filteredNotes.map((note: Note) => (
              <div key={note.id} className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                      {getStatusBadge(note.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{note.authorName}</span>
                        <Badge variant="outline" className="text-xs">
                          {note.authorRole}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={getSubjectColor(note.subject)}>
                        {note.subject.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">{note.topic}</span>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2">{note.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{note.viewsCount} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{note.downloadsCount} downloads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{note.likesCount} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{note.attachments?.length || 0} files</span>
                  </div>
                </div>

                {/* Actions */}
                {note.status === 'submitted' && (
                  <div className="flex space-x-3 pt-3 border-t">
                    <Button
                      onClick={() => approveMutation.mutate(note.id)}
                      disabled={approveMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve & Publish
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedNote(note)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Note: {note.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600">
                            <p><strong>Author:</strong> {note.authorName} ({note.authorEmail})</p>
                            <p><strong>Subject:</strong> {note.subject.replace('_', ' ')}</p>
                          </div>
                          <Textarea
                            placeholder="Please provide a reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                          />
                          <Button
                            onClick={() => rejectMutation.mutate({ 
                              noteId: note.id, 
                              reason: rejectionReason 
                            })}
                            disabled={rejectMutation.isPending || !rejectionReason.trim()}
                            variant="destructive"
                            className="w-full"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {notesData?.total > 20 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredNotes.length} of {notesData.total} notes
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
