import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Crown, 
  Calendar, 
  Download, 
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";

interface Subscription {
  id: string;
  plan: string;
  startDate: string;
  renewalDate: string;
  status: string;
  gateway?: string;
}

interface DownloadedNote {
  id: string;
  noteId: string;
  downloadedAt: string;
  note: {
    id: string;
    title: string;
    subject: string;
    type: string;
    description: string;
    createdAt: string;
  };
}

export default function Profile() {
  const { user } = useAuth();

  // Fetch user subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription | null>({
    queryKey: ['/api/subscription'],
    enabled: !!user,
  });

  // Fetch downloaded notes
  const { data: downloads, isLoading: downloadsLoading } = useQuery<{ downloads: DownloadedNote[] }>({
    queryKey: ['/api/downloads'],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-cyan-200/20 animate-study-pulse"></div>
      </div>
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-6 animate-slide-in-right" role="main">
          {/* Profile Header */}
          <section className="mb-8" aria-labelledby="profile-heading">
            <div className="bg-study-card rounded-3xl p-8 border border-slate-600/30 relative overflow-hidden hover-glow-intense">
              <div className="relative z-10">
                <header className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl animate-glow-pulse">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 id="profile-heading" className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent animate-scale-in">
                      My Profile
                    </h1>
                    <p className="text-slate-300 text-lg font-medium">
                      {user.firstName} {user.lastName} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                </header>
              </div>
            </div>
          </section>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Personal Information */}
            <Card className="bg-study-card border-2 border-blue-500/50 hover-study-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Full Name</label>
                  <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Role</label>
                  <Badge 
                    variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                    className="mt-1"
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="bg-study-card border-2 border-purple-500/50 hover-study-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Crown className="h-5 w-5" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Plan</span>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status</span>
                      <Badge className={getSubscriptionStatusColor(subscription.status)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Started</span>
                      <span className="text-white">{formatDate(subscription.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Renewal Date</span>
                      <span className="text-white">{formatDate(subscription.renewalDate)}</span>
                    </div>
                    {subscription.gateway && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Payment Method</span>
                        <div className="flex items-center gap-1 text-white">
                          <CreditCard className="h-4 w-4" />
                          {subscription.gateway.charAt(0).toUpperCase() + subscription.gateway.slice(1)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Crown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Subscription</h3>
                    <p className="text-slate-400 mb-4">Upgrade to Premium to access unlimited downloads and exclusive content.</p>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                      <Link href="/subscribe" data-testid="button-upgrade">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Downloaded Notes */}
          <Card className="bg-study-card border-2 border-green-500/50 hover-study-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Download className="h-5 w-5" />
                My Downloaded Notes
                {downloads?.downloads?.length && (
                  <Badge variant="secondary" className="ml-2">
                    {downloads.downloads.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {downloadsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : downloads?.downloads?.length ? (
                <div className="space-y-4">
                  {downloads.downloads.map((download) => (
                    <div 
                      key={download.id} 
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/30 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{download.note.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {download.note.subject}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {download.note.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{download.note.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-400 text-sm mb-1">
                          <Clock className="h-3 w-3" />
                          Downloaded
                        </div>
                        <span className="text-sm text-white">{formatDate(download.downloadedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Downloads Yet</h3>
                  <p className="text-slate-400 mb-4">Start downloading notes to see them here.</p>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500">
                    <Link href="/catalog" data-testid="button-browse">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Notes
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}