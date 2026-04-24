import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
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
  Calendar,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const { user } = useAuth();
  const { stats, subjectStats, isLoading } = useUserStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Notes
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-analytics-title">
              💰 My Earnings & Analytics
            </h1>
            <p className="text-muted-foreground" data-testid="text-analytics-description">
              Track your notes performance, earnings, and growth
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
                          {stats.totalDownloads.toLocaleString()}
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
                          {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-earnings">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-foreground">
                          ₹{stats.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-notes-count">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notes Uploaded</p>
                        <p className="text-2xl font-bold text-foreground">
                          {stats.notesUploaded.toLocaleString()}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card data-testid="card-earnings-overview">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>💰 Earnings Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">Monthly Earnings</p>
                        <p className="text-sm text-green-600">This month's income</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{stats.monthlyEarnings.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-500">Current month</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">Total Lifetime Earnings</p>
                        <p className="text-sm text-blue-600">All-time revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{stats.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-500">Lifetime</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">💰 Coins per verified upload</span>
                        <span className="font-medium text-yellow-600">20 coins</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">🎯 Bonus for quality notes</span>
                        <span className="font-medium text-green-600">+5-15 coins</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-performance-metrics">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>📊 Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Download Rate</span>
                        <span className="font-medium">
                          {stats.notesUploaded > 0 
                            ? Math.floor(stats.totalDownloads / stats.notesUploaded) 
                            : 0} downloads/note
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium text-green-600">
                          {stats.averageRating > 4 ? 'High' : stats.averageRating > 3 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Growth</span>
                        <span className="font-medium text-blue-600">
                          +{stats.monthlyEarnings > 0 ? '15%' : '0%'} this month
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium mb-3">📚 Subject Performance</h4>
                      <div className="space-y-2">
                        {subjectStats.slice(0, 3).map((subject, index) => (
                          <div key={subject.subject} className="flex items-center justify-between text-sm">
                            <span>{subject.subject}</span>
                            <span className="text-muted-foreground">
                              {subject.downloads} downloads
                            </span>
                          </div>
                        ))}
                        {subjectStats.length === 0 && (
                          <p className="text-sm text-muted-foreground">Upload notes to see subject performance</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Goals & Achievements */}
              <Card data-testid="card-goals-achievements">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>🎯 Goals & Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${
                      stats.averageRating >= 4.5 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stats.averageRating >= 4.5 ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium ${
                            stats.averageRating >= 4.5 ? 'text-green-800' : 'text-gray-800'
                          }`}>Top Rated Contributor</p>
                          <p className={`text-sm ${
                            stats.averageRating >= 4.5 ? 'text-green-600' : 'text-gray-600'
                          }`}>Maintain 4.5+ rating average</p>
                        </div>
                      </div>
                      <span className={`font-medium ${
                        stats.averageRating >= 4.5 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stats.averageRating >= 4.5 ? 'Achieved!' : `${stats.averageRating.toFixed(1)}/4.5`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">1K Downloads Milestone</p>
                          <p className="text-sm text-blue-600">
                            {stats.totalDownloads}/1000 downloads
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-medium">
                          {Math.floor((stats.totalDownloads / 1000) * 100)}%
                        </p>
                        <div className="w-16 h-2 bg-blue-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ 
                              width: `${Math.min((stats.totalDownloads / 1000) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-yellow-800">Upload 10 Notes Goal</p>
                          <p className="text-sm text-yellow-600">
                            {stats.notesUploaded}/10 notes uploaded
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-600 font-medium">
                          {Math.floor((stats.notesUploaded / 10) * 100)}%
                        </p>
                        <div className="w-16 h-2 bg-yellow-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-yellow-500 rounded-full"
                            style={{ 
                              width: `${Math.min((stats.notesUploaded / 10) * 100, 100)}%` 
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
