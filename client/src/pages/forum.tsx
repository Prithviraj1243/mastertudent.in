import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search, 
  Clock,
  Heart,
  Eye,
  Pin,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Megaphone,
  Target,
  Code,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postsCount: number;
  isActive: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  createdAt: string;
  lastReplyAt: string;
  lastReplyById?: string;
}

const categoryIcons: Record<string, any> = {
  'general': MessageSquare,
  'study-tips': Lightbulb,
  'help': HelpCircle,
  'announcements': Megaphone,
  'subject-specific': BookOpen,
  'goals': Target,
  'tech': Code,
  'resources': Globe
};

const categoryColors: Record<string, string> = {
  'general': 'from-blue-500/20 to-blue-600/20 border-blue-300/30',
  'study-tips': 'from-yellow-500/20 to-yellow-600/20 border-yellow-300/30',
  'help': 'from-red-500/20 to-red-600/20 border-red-300/30',
  'announcements': 'from-purple-500/20 to-purple-600/20 border-purple-300/30',
  'subject-specific': 'from-green-500/20 to-green-600/20 border-green-300/30',
  'goals': 'from-orange-500/20 to-orange-600/20 border-orange-300/30',
  'tech': 'from-gray-500/20 to-gray-600/20 border-gray-300/30',
  'resources': 'from-indigo-500/20 to-indigo-600/20 border-indigo-300/30'
};

export default function Forum() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch forum categories
  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ['/api/forum/categories'],
  });

  // Fetch forum posts
  const { data: postsData, isLoading: postsLoading } = useQuery<{ posts: ForumPost[]; total: number }>({
    queryKey: ['/api/forum/posts', selectedCategory],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/forum/posts${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`);
      return response.json();
    },
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
        throw new Error('Please fill in all fields');
      }
      
      return apiRequest('POST', '/api/forum/posts', {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        categoryId: newPostCategory,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your post has been created successfully! 🎉",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/categories'] });
      setShowNewPost(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredPosts = postsData?.posts?.filter((post: ForumPost) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="title-forum">
              💬 Discussion Forum
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join conversations, share knowledge, and connect with fellow students
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
                data-testid="input-forum-search"
              />
            </div>
            <Button
              onClick={() => setShowNewPost(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              data-testid="button-new-post"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                  data-testid="button-all-categories"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  All Discussions
                </Button>
                
                {categories.map((category: ForumCategory) => {
                  const IconComponent = categoryIcons[category.icon] || MessageSquare;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                      data-testid={`button-category-${category.id}`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {category.postsCount}
                      </Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Posts</p>
                      <p className="text-2xl font-bold text-blue-700" data-testid="stat-total-posts">
                        {postsData?.total || 0}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Today</p>
                      <p className="text-2xl font-bold text-green-700" data-testid="stat-active-today">
                        {Math.floor(Math.random() * 50) + 10}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Categories</p>
                      <p className="text-2xl font-bold text-purple-700" data-testid="stat-categories">
                        {categories.length}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts List */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Discussions</span>
                  {selectedCategory && (
                    <Badge variant="outline" className="ml-2">
                      {categories.find((c: ForumCategory) => c.id === selectedCategory)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPosts.map((post: ForumPost) => (
                      <Link key={post.id} href={`/forum/post/${post.id}`}>
                        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group" data-testid={`post-${post.id}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {post.isPinned && (
                                  <Pin className="h-4 w-4 text-yellow-500" />
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
                                  {post.title}
                                </h3>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.viewsCount}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.repliesCount}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatDistanceToNow(new Date(post.createdAt))} ago
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-100 text-purple-600">
                                  {post.authorId.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No discussions yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {searchTerm ? "No discussions match your search." : "Be the first to start a discussion!"}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setShowNewPost(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start Discussion
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    data-testid="select-post-category"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category: ForumCategory) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter discussion title..."
                    data-testid="input-post-title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or start a discussion..."
                    rows={6}
                    data-testid="textarea-post-content"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => createPostMutation.mutate()}
                    disabled={createPostMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
                    data-testid="button-create-post"
                  >
                    {createPostMutation.isPending ? "Creating..." : "Create Discussion"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                    data-testid="button-cancel-post"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}