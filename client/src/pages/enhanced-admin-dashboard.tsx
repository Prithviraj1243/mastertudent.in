import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  Crown, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Download,
  BarChart3,
  Settings,
  Shield,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  GraduationCap
} from 'lucide-react';
import TeacherAuth from "@/components/admin/teacher-auth";
import NoteApproval from "@/components/admin/note-approval";
import { apiRequest } from "@/lib/queryClient";

export default function EnhancedAdminDashboard() {
  const [teacherData, setTeacherData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for existing teacher session
  useEffect(() => {
    const savedAuth = localStorage.getItem('teacherAuth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setTeacherData(parsedAuth);
      } catch (error) {
        localStorage.removeItem('teacherAuth');
      }
    }
  }, []);

  // Mock data - In production, this would come from the main application's API
  const mockDashboardData = {
    totalUsers: 1247,
    totalNotes: 3456,
    pendingApprovals: 23,
    totalEarnings: 125000,
    monthlyGrowth: 15.2,
    topSubjects: [
      { name: 'Mathematics', notes: 856, downloads: 12450 },
      { name: 'Physics', notes: 743, downloads: 9876 },
      { name: 'Chemistry', notes: 654, downloads: 8234 },
      { name: 'Biology', notes: 567, downloads: 7123 },
      { name: 'Computer Science', notes: 636, downloads: 11234 }
    ],
    recentActivity: [
      { type: 'note_upload', user: 'Rahul Sharma', action: 'uploaded Advanced Calculus notes', time: '2 hours ago' },
      { type: 'subscription', user: 'Priya Patel', action: 'subscribed to yearly plan', time: '3 hours ago' },
      { type: 'note_approved', user: 'Arjun Singh', action: 'note approved by Prof. Kumar', time: '5 hours ago' },
      { type: 'withdrawal', user: 'Sneha Gupta', action: 'requested withdrawal of ₹2500', time: '1 day ago' }
    ],
    userStats: {
      students: 1089,
      toppers: 158,
      teachers: 12,
      activeToday: 234
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherAuth');
    setTeacherData(null);
  };

  // Show authentication screen if not logged in
  if (!teacherData) {
    return <TeacherAuth onAuthenticated={setTeacherData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  MasterStudent Admin
                </h1>
                <p className="text-sm text-gray-600">Teacher Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{teacherData.name}</p>
                <p className="text-xs text-gray-500">{teacherData.subject} • {teacherData.department}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Note Approval
              {mockDashboardData.pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {mockDashboardData.pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">{mockDashboardData.totalUsers.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+{mockDashboardData.monthlyGrowth}% from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Notes</p>
                          <p className="text-2xl font-bold text-gray-900">{mockDashboardData.totalNotes.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <Clock className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-orange-600">{mockDashboardData.pendingApprovals} pending approval</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">₹{mockDashboardData.totalEarnings.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Platform revenue</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Today</p>
                          <p className="text-2xl font-bold text-gray-900">{mockDashboardData.userStats.activeToday}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <Users className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600">Online users</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Subjects */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockDashboardData.topSubjects.map((subject, index) => (
                          <div key={subject.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{subject.name}</p>
                                <p className="text-sm text-gray-500">{subject.notes} notes</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{subject.downloads.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">downloads</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockDashboardData.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'note_upload' ? 'bg-blue-100' :
                              activity.type === 'subscription' ? 'bg-green-100' :
                              activity.type === 'note_approved' ? 'bg-purple-100' :
                              'bg-orange-100'
                            }`}>
                              {activity.type === 'note_upload' && <FileText className="w-4 h-4 text-blue-600" />}
                              {activity.type === 'subscription' && <Crown className="w-4 h-4 text-green-600" />}
                              {activity.type === 'note_approved' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                              {activity.type === 'withdrawal' && <DollarSign className="w-4 h-4 text-orange-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                              <p className="text-sm text-gray-600">{activity.action}</p>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="notes">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NoteApproval teacherData={teacherData} />
              </motion.div>
            </TabsContent>

            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{mockDashboardData.userStats.students}</p>
                        <p className="text-sm text-gray-600">Students</p>
                      </div>
                      <div className="text-center p-6 bg-purple-50 rounded-lg">
                        <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">{mockDashboardData.userStats.toppers}</p>
                        <p className="text-sm text-gray-600">Toppers</p>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{mockDashboardData.userStats.teachers}</p>
                        <p className="text-sm text-gray-600">Teachers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">System configuration and settings panel coming soon...</p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
