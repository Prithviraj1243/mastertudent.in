import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Download, 
  BookOpen, 
  ArrowLeft,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  LogOut
} from "lucide-react";
import { Link } from "wouter";
import PageWrapper from "@/components/layout/page-wrapper";
import { useToast } from "@/hooks/use-toast";

interface DownloadHistory {
  id: string;
  noteId: string;
  noteTitle: string;
  downloadedAt: string;
  subject?: string;
  price?: number;
}

export default function DownloadAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch download history
  const { data: downloadHistory = [], isLoading } = useQuery<DownloadHistory[]>({
    queryKey: ['/api/user/downloads'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/downloads', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) return [];
          throw new Error('Failed to fetch download history');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching download history:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Fetch user profile stats for download-related info
  const { data: profileStats } = useQuery<{
    totalDownloads: number;
    freeDownloadsLeft: number;
    coinBalance: number;
    totalSpent: number;
  }>({
    queryKey: ['/api/profile/stats'],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    sessionStorage.clear();
    localStorage.clear();
    
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      variant: "default"
    });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  if (!user) {
    return (
      <PageWrapper
        title="Download Analytics"
        subtitle="Track your downloaded notes"
        icon={<Download className="h-6 w-6 text-white" />}
      >
        <div className="text-center py-12">
          <p className="text-blue-300">Please log in to view your download analytics</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Download Analytics"
      subtitle="Track your downloaded notes"
      icon={<Download className="h-6 w-6 text-white" />}
    >
      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-blue-400/50">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-blue-300 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/download-notes">
                <Button
                  variant="outline"
                  className="bg-blue-600/20 border-blue-400/50 text-blue-300 hover:bg-blue-600/30 hover:text-white transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Notes
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-red-600/20 border-red-400/50 text-red-300 hover:bg-red-600/30 hover:text-white transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Download Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">Total Downloads</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {profileStats?.totalDownloads || downloadHistory.length}
                  </p>
                </div>
                <Download className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-300">Free Downloads Left</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {profileStats?.freeDownloadsLeft ?? 3}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-300">Coins Spent</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {profileStats?.totalSpent || 0}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download History */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-400" />
              Download History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
              </div>
            ) : downloadHistory.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-300">No downloads yet</p>
                <p className="text-blue-400/70 text-sm mt-2">Start downloading notes to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloadHistory.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{download.noteTitle}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          {download.subject && (
                            <span className="text-blue-300 text-sm">{download.subject}</span>
                          )}
                          <span className="text-blue-400/70 text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(download.downloadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {download.price !== undefined && (
                      <div className="text-right">
                        {download.price > 0 ? (
                          <span className="text-purple-400 font-semibold">
                            {download.price} coins
                          </span>
                        ) : (
                          <span className="text-green-400 font-semibold">
                            FREE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
