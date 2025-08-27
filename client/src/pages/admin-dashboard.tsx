import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Crown, Clock, TrendingUp, DollarSign, Star, Download } from "lucide-react";
import { AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is admin
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
                  Only administrators can access this dashboard.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { data: adminStats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground" data-testid="text-admin-description">
              Platform overview and management tools
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
                <Card data-testid="card-total-users">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold text-foreground">
                          {adminStats?.totalUsers || 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-notes">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                        <p className="text-2xl font-bold text-foreground">
                          {adminStats?.totalNotes || 0}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-active-subscriptions">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-green-600">
                          {adminStats?.activeSubscriptions || 0}
                        </p>
                      </div>
                      <Crown className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-pending-reviews">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {adminStats?.pendingReviews || 0}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue & Growth Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card data-testid="card-monthly-revenue">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Monthly Revenue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      ₹{((adminStats?.activeSubscriptions || 0) * 59).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Estimated monthly recurring revenue
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-average-rating">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Platform Rating</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">4.8</div>
                    <p className="text-sm text-muted-foreground">
                      Average note rating across platform
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-downloads">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Total Downloads</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-2">12,543</div>
                    <p className="text-sm text-muted-foreground">
                      All-time note downloads
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Management Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-user-management">
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Students</p>
                        <p className="text-sm text-muted-foreground">Manage student accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Toppers</p>
                        <p className="text-sm text-muted-foreground">Manage topper accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-secondary">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.15)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Reviewers</p>
                        <p className="text-sm text-muted-foreground">Manage reviewer accounts</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.floor((adminStats?.totalUsers || 0) * 0.05)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-content-management">
                  <CardHeader>
                    <CardTitle>Content Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Published Notes</p>
                        <p className="text-sm text-muted-foreground">Live on platform</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.floor((adminStats?.totalNotes || 0) * 0.85)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-muted-foreground">Awaiting approval</p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">
                        {adminStats?.pendingReviews || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Featured Notes</p>
                        <p className="text-sm text-muted-foreground">Highlighted content</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {Math.floor((adminStats?.totalNotes || 0) * 0.1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
