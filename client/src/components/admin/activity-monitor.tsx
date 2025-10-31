import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Users, Upload, Download, Eye, MessageSquare, 
  Clock, AlertCircle, CheckCircle, XCircle, RefreshCw 
} from "lucide-react";
import { useState } from "react";

export function ActivityMonitor() {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  const { data: activities = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/activities"],
    retry: false,
    refetchInterval: refreshInterval,
  });

  const { data: uploadRequests = [], isLoading: uploadsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/upload-requests"],
    retry: false,
    refetchInterval: refreshInterval,
  });

  const { data: userSessions = [], isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/user-sessions"],
    retry: false,
    refetchInterval: refreshInterval,
  });

  const getActivityIcon = (type: string) => {
    const icons = {
      login: Users,
      logout: Users,
      upload: Upload,
      download: Download,
      view: Eye,
      comment: MessageSquare,
      registration: Users,
      subscription: CheckCircle,
      withdrawal: AlertCircle,
    };
    const Icon = icons[type as keyof typeof icons] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      login: "text-green-600",
      logout: "text-gray-600", 
      upload: "text-blue-600",
      download: "text-purple-600",
      view: "text-orange-600",
      comment: "text-pink-600",
      registration: "text-emerald-600",
      subscription: "text-yellow-600",
      withdrawal: "text-red-600",
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      processing: { color: "bg-blue-100 text-blue-800", icon: RefreshCw },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Real-time Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Activity Monitor</span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={refreshInterval} 
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
              <Button size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Live Activities</TabsTrigger>
          <TabsTrigger value="uploads">Upload Requests</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="system">System Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.userName} • {activity.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.ipAddress}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activities
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Upload Requests & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {uploadsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadRequests.map((upload: any) => (
                      <div key={upload.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{upload.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {upload.subject} • Class {upload.classGrade}
                            </p>
                          </div>
                          {getStatusBadge(upload.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Uploader:</span>
                            <p>{upload.uploaderName}</p>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>
                            <p>{new Date(upload.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Files:</span>
                            <p>{upload.fileCount} attachment(s)</p>
                          </div>
                          <div>
                            <span className="font-medium">Size:</span>
                            <p>{upload.totalSize}</p>
                          </div>
                        </div>

                        {upload.description && (
                          <div className="bg-muted/50 p-3 rounded">
                            <p className="text-sm">{upload.description}</p>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No upload requests found
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userSessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-muted-foreground">{session.userEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Online
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.location} • {session.device}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active: {session.duration}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No active sessions
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{userSessions.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Uploads</p>
                    <p className="text-2xl font-bold">
                      {uploadRequests.filter((u: any) => u.status === 'pending').length || 0}
                    </p>
                  </div>
                  <Upload className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Activities</p>
                    <p className="text-2xl font-bold">{activities.length || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Status</p>
                    <p className="text-lg font-bold text-green-600">Healthy</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}