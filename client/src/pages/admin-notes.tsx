import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Search,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Key,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  User
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface AdminNote {
  id: string;
  title: string;
  subject: string;
  status: string;
  createdAt: string;
  topperId: string;
  topperName?: string;
  teacherId?: string;
  teacherPassword?: string;
}

interface AdminNotesResponse {
  notes: AdminNote[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminNotes() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Teacher credentials inline editing state
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [teacherCredentials, setTeacherCredentials] = useState<{[key: string]: {id: string, password: string}}>({});

  // Mutation to save teacher credentials (MOVED BEFORE CONDITIONAL RETURN)
  const saveCredentialsMutation = useMutation({
    mutationFn: async ({ noteId, teacherId, teacherPassword }: { noteId: string, teacherId: string, teacherPassword: string }) => {
      const res = await fetch(`/api/admin/notes/${noteId}/teacher-credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teacherId, teacherPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update credentials");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Teacher credentials saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      setExpandedNoteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle expanding/collapsing credential section
  const toggleCredentials = (note: AdminNote) => {
    if (expandedNoteId === note.id) {
      setExpandedNoteId(null);
    } else {
      setExpandedNoteId(note.id);
      // Pre-fill with existing credentials
      setTeacherCredentials({
        ...teacherCredentials,
        [note.id]: {
          id: note.teacherId || "",
          password: note.teacherPassword || ""
        }
      });
    }
  };

  // Handle saving credentials
  const handleSaveCredentials = (noteId: string) => {
    const creds = teacherCredentials[noteId];
    if (!creds?.id.trim() || !creds?.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Both Teacher ID and Password are required",
        variant: "destructive",
      });
      return;
    }

    saveCredentialsMutation.mutate({
      noteId,
      teacherId: creds.id,
      teacherPassword: creds.password
    });
  };

  const { data, isLoading, error } = useQuery<AdminNotesResponse>({
    queryKey: ["/api/admin/notes", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const res = await fetch(`/api/admin/notes?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    retry: false,
  });

  const filteredNotes = data?.notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title?.toLowerCase().includes(query) ||
      note.subject?.toLowerCase().includes(query)
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
            {status}
          </Badge>
        );
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Redirect if not admin - AFTER all hooks to follow Rules of Hooks
  if (!isAuthenticated || user?.role !== "admin") {
    if (typeof window !== 'undefined') {
      setTimeout(() => setLocation("/"), 100);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Notes</CardTitle>
              <CardDescription>Failed to fetch notes data</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Notes Management
                </h1>
                <p className="text-blue-300 text-sm sm:text-base mt-1">
                  {data?.total || 0} total notes
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search notes by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-slate-800/50 border-slate-700/50 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="submitted">Pending Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes List */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">All Notes</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {filteredNotes.length} of {data?.total || 0} notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notes found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                            {note.title}
                          </h3>
                          {getStatusBadge(note.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {note.subject}
                          </span>
                          {note.createdAt && (
                            <span>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCredentials(note)}
                          className="border-blue-600/50 text-blue-300 hover:text-blue-200 hover:bg-blue-600/20"
                          title="Set Teacher Credentials"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          {note.teacherId ? "Edit" : "Add"} ID
                          {expandedNoteId === note.id ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                        <Link href={`/notes/${note.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600/50 text-slate-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Inline Teacher Credentials Section */}
                    {expandedNoteId === note.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Key className="h-5 w-5 text-blue-400" />
                            <h4 className="text-white font-semibold">Teacher Access Credentials</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`teacher-id-${note.id}`} className="text-slate-300 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                Teacher ID
                              </Label>
                              <Input
                                id={`teacher-id-${note.id}`}
                                type="text"
                                placeholder="e.g., TEACH001"
                                value={teacherCredentials[note.id]?.id || ""}
                                onChange={(e) => setTeacherCredentials({
                                  ...teacherCredentials,
                                  [note.id]: {
                                    ...teacherCredentials[note.id],
                                    id: e.target.value
                                  }
                                })}
                                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                                disabled={saveCredentialsMutation.isPending}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`teacher-password-${note.id}`} className="text-slate-300 flex items-center gap-2">
                                <Key className="h-4 w-4 text-blue-400" />
                                Password
                              </Label>
                              <Input
                                id={`teacher-password-${note.id}`}
                                type="text"
                                placeholder="Enter password"
                                value={teacherCredentials[note.id]?.password || ""}
                                onChange={(e) => setTeacherCredentials({
                                  ...teacherCredentials,
                                  [note.id]: {
                                    ...teacherCredentials[note.id],
                                    password: e.target.value
                                  }
                                })}
                                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                                disabled={saveCredentialsMutation.isPending}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-slate-500">
                              Teachers will use these credentials to access this note
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedNoteId(null)}
                                disabled={saveCredentialsMutation.isPending}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveCredentials(note.id)}
                                disabled={saveCredentialsMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {saveCredentialsMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-slate-600/50 text-slate-300"
            >
              Previous
            </Button>
            <span className="text-slate-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-slate-600/50 text-slate-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

