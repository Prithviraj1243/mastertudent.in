import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  User,
  Calendar,
  BookOpen,
  Star,
  MessageSquare,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NoteApprovalProps {
  teacherData: any;
}

export default function NoteApproval({ teacherData }: NoteApprovalProps) {
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock notes data - In production, this would come from the API
  const mockNotes = [
    {
      id: '1',
      title: 'Advanced Calculus - Derivatives and Integration',
      subject: 'Mathematics',
      chapter: 'Calculus',
      unit: 'Derivatives',
      studentName: 'Rahul Sharma',
      studentId: 'STU001',
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      fileType: 'PDF',
      fileSize: '2.5 MB',
      description: 'Comprehensive notes on derivatives with solved examples and practice problems.',
      tags: ['calculus', 'derivatives', 'mathematics', 'advanced'],
      views: 0,
      downloads: 0,
      rating: 0
    },
    {
      id: '2',
      title: 'Organic Chemistry - Reaction Mechanisms',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      unit: 'Reaction Mechanisms',
      studentName: 'Priya Patel',
      studentId: 'STU002',
      uploadedAt: '2024-01-14T15:45:00Z',
      status: 'pending',
      fileType: 'PDF',
      fileSize: '3.2 MB',
      description: 'Detailed explanation of organic reaction mechanisms with step-by-step processes.',
      tags: ['chemistry', 'organic', 'reactions', 'mechanisms'],
      views: 0,
      downloads: 0,
      rating: 0
    },
    {
      id: '3',
      title: 'Physics - Quantum Mechanics Basics',
      subject: 'Physics',
      chapter: 'Modern Physics',
      unit: 'Quantum Mechanics',
      studentName: 'Arjun Singh',
      studentId: 'STU003',
      uploadedAt: '2024-01-13T09:20:00Z',
      status: 'approved',
      fileType: 'PDF',
      fileSize: '4.1 MB',
      description: 'Introduction to quantum mechanics with fundamental concepts and applications.',
      tags: ['physics', 'quantum', 'modern physics', 'mechanics'],
      views: 45,
      downloads: 12,
      rating: 4.5,
      reviewedBy: 'Prof. Rajesh Kumar',
      reviewedAt: '2024-01-14T11:30:00Z',
      reviewComment: 'Excellent content with clear explanations. Approved for publication.'
    },
    {
      id: '4',
      title: 'Biology - Cell Structure and Functions',
      subject: 'Biology',
      chapter: 'Cell Biology',
      unit: 'Cell Structure',
      studentName: 'Sneha Gupta',
      studentId: 'STU004',
      uploadedAt: '2024-01-12T14:15:00Z',
      status: 'rejected',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      description: 'Basic notes on cell structure and their functions.',
      tags: ['biology', 'cell', 'structure', 'functions'],
      views: 0,
      downloads: 0,
      rating: 0,
      reviewedBy: 'Dr. Anita Verma',
      reviewedAt: '2024-01-13T16:45:00Z',
      reviewComment: 'Content needs more detailed explanations and better diagrams. Please revise and resubmit.'
    }
  ];

  const filteredNotes = mockNotes.filter(note => {
    const matchesStatus = filterStatus === 'all' || note.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by teacher's subject if not admin
    const matchesSubject = teacherData.subject === 'All Subjects' || note.subject === teacherData.subject;
    
    return matchesStatus && matchesSearch && matchesSubject;
  });

  const approveNote = useMutation({
    mutationFn: ({ noteId, comment }: { noteId: string; comment: string }) => 
      apiRequest(`/api/admin/notes/${noteId}/approve`, "PATCH", { 
        reviewComment: comment,
        reviewerId: teacherData.id 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      toast({ 
        title: "Note Approved! ✅", 
        description: "The note has been approved and is now live for students." 
      });
      setReviewComment('');
      setSelectedNote(null);
    },
    onError: () => {
      toast({ 
        title: "Approval Failed", 
        description: "Failed to approve the note. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const rejectNote = useMutation({
    mutationFn: ({ noteId, comment }: { noteId: string; comment: string }) => 
      apiRequest(`/api/admin/notes/${noteId}/reject`, "PATCH", { 
        reviewComment: comment,
        reviewerId: teacherData.id 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      toast({ 
        title: "Note Rejected", 
        description: "The note has been rejected with feedback sent to the student." 
      });
      setReviewComment('');
      setSelectedNote(null);
    },
    onError: () => {
      toast({ 
        title: "Rejection Failed", 
        description: "Failed to reject the note. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Note Approval System</h2>
          <p className="text-gray-600">Review and approve student submissions</p>
        </div>
        <div className="text-sm text-gray-500">
          Logged in as: <span className="font-medium text-orange-600">{teacherData.name}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notes, subjects, or students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All Notes
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending ({mockNotes.filter(n => n.status === 'pending').length})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('rejected')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="grid gap-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notes found</h3>
              <p className="text-gray-500">No notes match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                        {getStatusBadge(note.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{note.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {note.subject}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {note.studentName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(note.uploadedAt)}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {note.fileType} • {note.fileSize}
                        </div>
                      </div>

                      {note.status !== 'pending' && note.reviewComment && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Review Comment:</span>
                          </div>
                          <p className="text-sm text-gray-600">{note.reviewComment}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed by {note.reviewedBy} on {formatDate(note.reviewedAt!)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedNote(note)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{note.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Subject:</strong> {note.subject}</div>
                              <div><strong>Chapter:</strong> {note.chapter}</div>
                              <div><strong>Unit:</strong> {note.unit}</div>
                              <div><strong>Student:</strong> {note.studentName}</div>
                            </div>
                            <div>
                              <strong>Description:</strong>
                              <p className="mt-1 text-gray-600">{note.description}</p>
                            </div>
                            <div>
                              <strong>Tags:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {note.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {note.status === 'pending' && (
                              <div className="border-t pt-4">
                                <Label htmlFor="reviewComment">Review Comment</Label>
                                <Textarea
                                  id="reviewComment"
                                  placeholder="Add your review comments here..."
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="mt-2"
                                  rows={3}
                                />
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    onClick={() => approveNote.mutate({ noteId: note.id, comment: reviewComment })}
                                    disabled={approveNote.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve Note
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => rejectNote.mutate({ noteId: note.id, comment: reviewComment })}
                                    disabled={rejectNote.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject Note
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {note.status === 'approved' && (
                        <div className="text-xs text-gray-500 text-center">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {note.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {note.downloads}
                          </div>
                          {note.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {note.rating}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
