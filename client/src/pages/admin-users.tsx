import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not admin - with smooth transition
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

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const filteredUsers = users?.filter((u) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(query) ||
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "topper":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "reviewer":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-300 border-green-500/30";
    }
  };

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
              <CardTitle className="text-red-400">Error Loading Users</CardTitle>
              <CardDescription>Failed to fetch user data</CardDescription>
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
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-blue-300 text-sm sm:text-base mt-1">
                  {users?.length || 0} total users
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Users List */}
        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">All Users</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {filteredUsers.length} of {users?.length || 0} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                              {u.firstName} {u.lastName}
                            </h3>
                            <Badge className={getRoleBadgeColor(u.role || "student")}>
                              {u.role || "student"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          {u.createdAt && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Joined {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600/50 text-slate-300 hover:text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

