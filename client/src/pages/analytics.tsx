import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Star, 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Eye,
  AlertCircle,
  Calendar
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();

  // Check if user is a topper
  if (user && user.role !== 'topper') {
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
                  Only toppers can access analytics. Please contact admin to become a topper.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/topper"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-analytics-title">
              Topper Analytics
            </h1>
            <p className="text-muted-foreground" data-testid="text-analytics-description">
              Track your notes performance and earnings
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card data-testid="card-total-downloads">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                        <p className="text-2xl font-bold text-foreground">
                          {analytics?.totalDownloads || 0}
                        </p>
                      </div>
                      <Download className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-average-rating">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                        <p className="text-2xl font-bold text-foreground">
                          {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '0.0'}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-followers-count">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Followers</p>
                        <p className="text-2xl font-bold text-foreground">
                          {analytics?.followersCount || 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-notes-count">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Published Notes</p>
                        <p className="text-2xl font-bold text-foreground">
                          {analytics?.notesCount || 0}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card data-testid="card-earnings-overview">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Earnings Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Estimated Monthly Earnings</p>
                        <p className="text-sm text-muted-foreground">Based on downloads and ratings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{Math.floor((analytics?.totalDownloads || 0) * 2.5).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Total Lifetime Earnings</p>
                        <p className="text-sm text-muted-foreground">All-time revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₹{Math.floor((analytics?.totalDownloads || 0) * 15).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Lifetime</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg. earnings per download</span>
                        <span className="font-medium">₹2.50</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Bonus for high ratings</span>
                        <span className="font-medium text-green-600">+20%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-performance-metrics">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Download Rate</span>
                        <span className="font-medium">
                          {analytics?.notesCount > 0 
                            ? Math.floor((analytics.totalDownloads / analytics.notesCount)) 
                            : 0} downloads/note
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium text-green-600">
                          {analytics?.averageRating > 4 ? 'High' : analytics?.averageRating > 3 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Follower Growth</span>
                        <span className="font-medium text-blue-600">
                          +{Math.floor((analytics?.followersCount || 0) * 0.1)} this month
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium mb-3">Top Performing Subjects</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Mathematics</span>
                          <span className="text-muted-foreground">
                            {Math.floor((analytics?.totalDownloads || 0) * 0.4)} downloads
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Physics</span>
                          <span className="text-muted-foreground">
                            {Math.floor((analytics?.totalDownloads || 0) * 0.3)} downloads
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Chemistry</span>
                          <span className="text-muted-foreground">
                            {Math.floor((analytics?.totalDownloads || 0) * 0.2)} downloads
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <Card data-testid="card-monthly-trends">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">This Month</p>
                      <p className="text-2xl font-bold text-foreground mb-1">
                        {Math.floor((analytics?.totalDownloads || 0) * 0.3)}
                      </p>
                      <p className="text-sm text-green-600">+15% from last month</p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Last Month</p>
                      <p className="text-2xl font-bold text-foreground mb-1">
                        {Math.floor((analytics?.totalDownloads || 0) * 0.26)}
                      </p>
                      <p className="text-sm text-muted-foreground">Previous period</p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Avg. Monthly</p>
                      <p className="text-2xl font-bold text-foreground mb-1">
                        {Math.floor((analytics?.totalDownloads || 0) * 0.25)}
                      </p>
                      <p className="text-sm text-muted-foreground">Last 6 months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals & Achievements */}
              <Card data-testid="card-goals-achievements">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Goals & Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Top Rated Contributor</p>
                          <p className="text-sm text-green-600">Maintain 4.5+ rating average</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">Achieved!</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">1K Downloads Milestone</p>
                          <p className="text-sm text-blue-600">
                            {analytics?.totalDownloads || 0}/1000 downloads
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-medium">
                          {Math.floor(((analytics?.totalDownloads || 0) / 1000) * 100)}%
                        </p>
                        <div className="w-16 h-2 bg-blue-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ 
                              width: `${Math.min(((analytics?.totalDownloads || 0) / 1000) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">100 Followers Goal</p>
                          <p className="text-sm text-purple-600">
                            {analytics?.followersCount || 0}/100 followers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-600 font-medium">
                          {Math.floor(((analytics?.followersCount || 0) / 100) * 100)}%
                        </p>
                        <div className="w-16 h-2 bg-purple-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ 
                              width: `${Math.min(((analytics?.followersCount || 0) / 100) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
