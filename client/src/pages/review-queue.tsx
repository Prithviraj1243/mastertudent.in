import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle, Edit, TrendingUp, AlertCircle, FileText, User, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";

export default function ReviewQueue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionComment, setRejectionComment] = useState("");
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // Check if user has admin permissions
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  Only admin members can access the review queue for quality control.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: reviewTasks, isLoading } = useQuery({
    queryKey: ["/api/review/queue"],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("PUT", `/api/review/${taskId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note approved and published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/review/queue"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to approve note",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ taskId, comments }: { taskId: string; comments: string[] }) => {
      await apiRequest("PUT", `/api/review/${taskId}/reject`, { comments });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note rejected with feedback sent to topper.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/review/queue"] });
      setRejectionDialogOpen(false);
      setRejectionComment("");
      setSelectedTaskId("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to reject note",
        variant: "destructive",
      });
    },
  });

  const handleRejectClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setRejectionDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionComment.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    rejectMutation.mutate({ 
      taskId: selectedTaskId, 
      comments: [rejectionComment.trim()] 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'changes_requested':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Changes Requested</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-review-title">
              Review Queue
            </h1>
            <p className="text-muted-foreground" data-testid="text-review-description">
              Review and approve submitted notes from toppers
            </p>
          </div>

          {/* Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-pending-reviews">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reviewTasks?.filter((task: any) => task.status === 'open').length || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-approved-today">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reviewTasks?.filter((task: any) => 
                        task.status === 'approved' && 
                        new Date(task.decidedAt).toDateString() === new Date().toDateString()
                      ).length || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-changes-requested">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Changes Requested</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {reviewTasks?.filter((task: any) => task.status === 'changes_requested').length || 0}
                    </p>
                  </div>
                  <Edit className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-review-time">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Review Time</p>
                    <p className="text-2xl font-bold text-foreground">2.3h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Queue List */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : reviewTasks?.length > 0 ? (
                <div className="divide-y divide-border">
                  {reviewTasks.map((task: any) => (
                    <div 
                      key={task.id} 
                      className="p-6 hover:bg-accent transition-colors"
                      data-testid={`review-task-${task.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {task.note?.title || 'Untitled Note'}
                            </h3>
                            {getStatusBadge(task.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span>{task.note?.subject} • {task.note?.classGrade}</span>
                            <span>•</span>
                            <span>Submitted {new Date(task.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>by {task.note?.topper?.firstName} {task.note?.topper?.lastName}</span>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-4">
                            {task.note?.description || 'No description provided'}
                          </p>
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {task.note?.attachments?.length || 0} files
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Topper Rating: {task.note?.topper?.topperProfile?.ratingAvg || 'N/A'}/5
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-6">
                          {task.status === 'open' && (
                            <>
                              <Button
                                onClick={() => approveMutation.mutate(task.id)}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-${task.id}`}
                              >
                                {approveMutation.isPending ? "Approving..." : "Approve"}
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRejectClick(task.id)}
                                    disabled={rejectMutation.isPending}
                                    data-testid={`button-reject-${task.id}`}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Reject Note - Provide Reason</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">
                                        Reason for rejection (will be sent to the topper):
                                      </label>
                                      <Textarea
                                        value={rejectionComment}
                                        onChange={(e) => setRejectionComment(e.target.value)}
                                        placeholder="Please provide specific feedback on what needs to be improved..."
                                        className="mt-2"
                                        rows={4}
                                        data-testid="textarea-rejection-comment"
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setRejectionDialogOpen(false);
                                          setRejectionComment("");
                                          setSelectedTaskId("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleRejectSubmit}
                                        disabled={rejectMutation.isPending || !rejectionComment.trim()}
                                        className="bg-red-600 hover:bg-red-700"
                                        data-testid="button-confirm-reject"
                                      >
                                        {rejectMutation.isPending ? "Rejecting..." : "Reject Note"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                          <Button 
                            variant="outline"
                            data-testid={`button-preview-${task.id}`}
                          >
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="empty-review-queue">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pending reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    All submitted notes have been reviewed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
