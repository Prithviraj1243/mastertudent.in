import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { MetaTags, generateNoteMetaTags } from "@/components/seo/meta-tags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Download, 
  Star, 
  Heart, 
  Calendar, 
  User, 
  BookOpen, 
  GraduationCap,
  MessageSquare,
  AlertCircle,
  StarIcon
} from "lucide-react";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface NoteDetailParams {
  id: string;
}

export default function NoteDetail() {
  const { id } = useParams<NoteDetailParams>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: noteData, isLoading } = useQuery({
    queryKey: ["/api/notes", id],
    enabled: !!id,
    retry: false,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/notes/${id}/download`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Download Started",
        description: "Your note download has been recorded.",
      });
      // In a real app, this would trigger the actual file download
      console.log("Download URLs:", data.downloadUrl);
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
      
      if (error.message.includes("subscription required")) {
        toast({
          title: "Subscription Required",
          description: "Please subscribe to download notes.",
          variant: "destructive",
        });
        // Redirect to subscription page
        window.location.href = "/subscribe";
        return;
      }
      
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download note",
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/notes/${id}/feedback`, {
        rating,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["/api/notes", id] });
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
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: async (topperId: string) => {
      await apiRequest("POST", `/api/follow/${topperId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You are now following this topper!",
      });
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
        description: error.message || "Failed to follow topper",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!noteData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Note Not Found</h2>
                <p className="text-muted-foreground">
                  The note you're looking for doesn't exist or has been removed.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const note = noteData as any;
  const averageRating = note?.feedback?.length > 0 
    ? note.feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / note.feedback.length 
    : 0;

  // Generate SEO meta tags for this specific note
  const metaTags = generateNoteMetaTags(note);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags {...metaTags} />
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Note Header */}
            <Card data-testid="note-header">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-foreground" data-testid="text-note-title">
                        {note.title}
                      </h1>
                      {note.featured && (
                        <Badge className="bg-green-100 text-green-800">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span data-testid="text-note-subject">{note.subject}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="h-4 w-4" />
                        <span data-testid="text-note-class">{note.classGrade}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(note.publishedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                    {note.topic && (
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>Topic:</strong> {note.topic}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-6">
                    <Button
                      onClick={() => downloadMutation.mutate()}
                      disabled={downloadMutation.isPending}
                      data-testid="button-download"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloadMutation.isPending ? "Downloading..." : "Download"}
                    </Button>
                    <Button variant="outline" data-testid="button-favorite">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6" data-testid="text-note-description">
                  {note.description}
                </p>

                {/* Note Stats */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= averageRating ? 'fill-current' : ''
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground" data-testid="text-average-rating">
                        {averageRating.toFixed(1)} ({note.feedback?.length || 0} reviews)
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground" data-testid="text-downloads-count">
                      <Download className="h-4 w-4 inline mr-1" />
                      {note.downloadsCount} downloads
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topper Info */}
            <Card data-testid="topper-info">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>About the Topper</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {note.topper?.firstName?.[0]}{note.topper?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground" data-testid="text-topper-name">
                        {note.topper?.firstName} {note.topper?.lastName}
                      </h3>
                      {note.topper?.topperProfile?.achievements && (
                        <p className="text-sm text-muted-foreground" data-testid="text-topper-achievements">
                          {note.topper.topperProfile.achievements}
                        </p>
                      )}
                      {note.topper?.topperProfile?.bio && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {note.topper.topperProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => followMutation.mutate(note.topperId)}
                    disabled={followMutation.isPending}
                    data-testid="button-follow-topper"
                  >
                    {followMutation.isPending ? "Following..." : "Follow"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card data-testid="feedback-section">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Feedback & Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Feedback Form */}
                {user && (
                  <div className="border border-border rounded-lg p-4" data-testid="feedback-form">
                    <h4 className="font-medium mb-4">Leave Your Feedback</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-6 w-6 cursor-pointer transition-colors ${
                                star <= rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                              onClick={() => setRating(star)}
                              data-testid={`star-${star}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts about these notes..."
                          rows={3}
                          data-testid="textarea-feedback-comment"
                        />
                      </div>
                      <Button
                        onClick={() => feedbackMutation.mutate()}
                        disabled={feedbackMutation.isPending}
                        data-testid="button-submit-feedback"
                      >
                        {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Feedback */}
                <div className="space-y-4" data-testid="feedback-list">
                  {note.feedback?.length > 0 ? (
                    note.feedback.map((feedback: any) => (
                      <div key={feedback.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {feedback.student?.firstName?.[0]}{feedback.student?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {feedback.student?.firstName} {feedback.student?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= feedback.rating ? 'fill-current' : ''
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No feedback yet. Be the first to review these notes!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
