import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats, useSubjectContent } from "@/hooks/useUserStats";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, FileText, AlertCircle, BookOpen, Layers, Target, CheckCircle, X, Coins, Sparkles } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  subject: z.string().min(1, "Subject is required"),
  chapter: z.string().min(1, "Chapter is required"),
  unit: z.string().min(1, "Unit is required"),
  topic: z.string().min(1, "Topic is required"),
  classGrade: z.string().min(1, "Class/Grade is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  categoryId: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats, updateStats } = useUserStats();
  const [location] = useLocation();
  
  // Get subject from URL params if coming from subject card
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
      form.setValue('subject', subjectParam);
    }
  }, [location]);

  // Fetch educational categories
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/educational-categories'],
  });

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      subject: "",
      chapter: "",
      unit: "",
      topic: "",
      classGrade: "",
      description: "",
      categoryId: "",
    },
  });

  // Get subject content (chapters and units)
  const subjectContent = useSubjectContent(selectedSubject);


  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        // Convert "none" categoryId to empty string
        if (key === 'categoryId' && value === 'none') {
          formData.append(key, '');
        } else {
          formData.append(key, value);
        }
      });
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/notes', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.coinsEarned) {
        toast({
          title: "🎉 Upload Successful!",
          description: `Your notes have been submitted for review and you earned ${data.coinsEarned} coins!`,
        });
        
        // Show additional success info
        setTimeout(() => {
          toast({
            title: "✅ What's Next?",
            description: "Your notes are now under review by our team. Once approved, they'll be available for download by other students!",
          });
        }, 2000);
      } else {
        toast({
          title: "🎉 Upload Successful!",
          description: data.message || "Your notes have been submitted for review!",
        });
      }
      
      // Update user stats
      updateStats({ 
        subject: form.getValues('subject'), 
        noteId: data.id 
      });
      
      form.reset();
      setFiles([]);
      setSelectedSubject("");
      setSelectedChapter("");
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coins/balance"] });
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
        description: error.message || "Failed to upload notes",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ];
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a supported file type.`,
            variant: "destructive",
          });
          return false;
        }
        
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 50MB.`,
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      });
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: UploadFormData) => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one file",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(data);
  };

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", 
    "English", "History", "Geography", "Economics", "Political Science"
  ];

  const classes = [
    "Class 9", "Class 10", "Class 11", "Class 12", "Undergraduate", "Postgraduate"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Signup Page */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 3 === 0 ? 'w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500' :
                i % 3 === 1 ? 'w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500' :
                'w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Header />
      <div className="relative z-10 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header with Stats */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    Upload Study Notes 🚀
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Share your knowledge and earn from your study materials
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-200 shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.notesUploaded}</div>
                    <div className="text-sm text-gray-600">Notes Uploaded</div>
                    <div className="text-xs text-green-600 font-medium">₹{stats.totalEarnings} Earned</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Indicators */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-green-200 text-center">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-700">Step 1: Content</div>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-blue-200 text-center">
                  <Layers className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-700">Step 2: Structure</div>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-yellow-200 text-center">
                  <UploadIcon className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-700">Step 3: Files</div>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-purple-200 text-center">
                  <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-700">Step 4: Publish</div>
                </div>
              </div>
            </div>

            <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <span>Note Details</span>
                  {selectedSubject && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto">
                      {selectedSubject}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter a descriptive title" 
                                {...field}
                                data-testid="input-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedSubject(value);
                                setSelectedChapter("");
                                form.setValue('chapter', '');
                                form.setValue('unit', '');
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-subject">
                                  <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Chapter and Unit Selection */}
                    {selectedSubject && subjectContent.chapters.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <Layers className="h-5 w-5 text-blue-600 mr-2" />
                          Subject Structure
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="chapter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Chapter</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedChapter(value);
                                    form.setValue('unit', '');
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Chapter" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subjectContent.chapters.map((chapter) => (
                                      <SelectItem key={chapter} value={chapter}>
                                        {chapter}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit/Topic</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={selectedChapter ? "Select Unit" : "Select Chapter first"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedChapter && subjectContent.units[selectedChapter] ? 
                                      subjectContent.units[selectedChapter].map((unit) => (
                                        <SelectItem key={unit} value={unit}>
                                          {unit}
                                        </SelectItem>
                                      )) : (
                                        <SelectItem value="none" disabled>
                                          Select a chapter first
                                        </SelectItem>
                                      )
                                    }
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic/Chapter</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Specific topic covered" 
                                {...field}
                                data-testid="input-topic"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="classGrade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class/Grade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-class">
                                  <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls} value={cls}>
                                    {cls}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Educational Category Selection */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educational Category (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Choose a category that best fits this note" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              <SelectItem value="none">No specific category</SelectItem>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center space-x-2">
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({category.categoryType.replace('_', ' ')})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Selecting a category helps students find your notes more easily
                          </p>
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4}
                              placeholder="Describe what's covered in these notes, key concepts, and any special features..."
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center mb-4">
                        <UploadIcon className="h-6 w-6 text-yellow-600 mr-2" />
                        <label className="text-lg font-semibold text-gray-800">
                          Upload Files
                        </label>
                        <Badge className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          Step 3
                        </Badge>
                      </div>
                      
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                          dragOver 
                            ? 'border-yellow-400 bg-yellow-100/50 scale-105' 
                            : 'border-yellow-300 bg-white/50 hover:border-yellow-400 hover:bg-yellow-50/50'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        data-testid="file-upload-area"
                      >
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 w-fit mx-auto mb-4">
                          <UploadIcon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Drag and drop your files here
                        </h3>
                        <p className="text-gray-600 mb-4">
                          or click to browse from your computer
                        </p>
                        
                        {/* Supported Formats */}
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">Supported formats:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="text-xs">PDF</Badge>
                            <Badge variant="outline" className="text-xs">DOC/DOCX</Badge>
                            <Badge variant="outline" className="text-xs">PPT/PPTX</Badge>
                            <Badge variant="outline" className="text-xs">XLS/XLSX</Badge>
                            <Badge variant="outline" className="text-xs">TXT</Badge>
                            <Badge variant="outline" className="text-xs">JPG/PNG</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Maximum file size: 50MB each</p>
                        </div>
                        
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-input"
                        />
                        <Button 
                          type="button" 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => document.getElementById('file-input')?.click()}
                          data-testid="button-choose-files"
                        >
                          <UploadIcon className="mr-2 h-5 w-5" />
                          Choose Files
                        </Button>
                      </div>

                      {/* File List */}
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2" data-testid="file-list">
                          {files.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 bg-muted rounded-md"
                              data-testid={`file-item-${index}`}
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                data-testid={`button-remove-file-${index}`}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Coin Reward Information */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3">
                          <Coins className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">💰 Earn Coins for Your Upload!</h3>
                          <p className="text-sm text-gray-600">Get rewarded for sharing quality notes</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">After Verification</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 mb-1">+20 Coins</div>
                          <p className="text-xs text-gray-600">Earned once your notes are approved by our team</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">Bonus Rewards</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600 mb-1">+5-15 Coins</div>
                          <p className="text-xs text-gray-600">Extra coins for high-quality, popular notes</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">
                            💡 Tip: Upload detailed, well-organized notes to earn maximum coins and help more students!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        data-testid="button-save-draft"
                      >
                        Save as Draft
                      </Button>
                      <div className="space-x-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          data-testid="button-preview"
                        >
                          Preview
                        </Button>
                        <Button 
                          type="submit"
                          disabled={uploadMutation.isPending}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          data-testid="button-submit"
                        >
                          {uploadMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UploadIcon className="h-4 w-4" />
                              Submit & Earn 20 Coins
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
