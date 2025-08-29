import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload as UploadIcon, FileText, AlertCircle } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  classGrade: z.string().min(1, "Class/Grade is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  categoryId: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch educational categories
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/educational-categories'],
  });

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      subject: "",
      topic: "",
      classGrade: "",
      description: "",
      categoryId: "",
    },
  });

  // Check if user is a topper
  if (user && user.role !== 'topper' && user.role !== 'admin') {
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
                  Only verified toppers can upload notes. Please contact admin to become a topper.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notes uploaded successfully! They are now in draft status.",
      });
      form.reset();
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
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
      setFiles(prev => [...prev, ...newFiles]);
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-upload-title">
                Upload Study Notes
              </h1>
              <p className="text-muted-foreground" data-testid="text-upload-description">
                Share your knowledge and earn from your study materials
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Note Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                              <SelectItem value="">No specific category</SelectItem>
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
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Upload Files
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragOver ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        data-testid="file-upload-area"
                      >
                        <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop your files here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 50MB each)
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-input"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('file-input')?.click()}
                          data-testid="button-choose-files"
                        >
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

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        data-testid="button-save-draft"
                      >
                        Save as Draft
                      </Button>
                      <div className="space-x-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          data-testid="button-preview"
                        >
                          Preview
                        </Button>
                        <Button 
                          type="submit"
                          disabled={uploadMutation.isPending}
                          data-testid="button-submit"
                        >
                          {uploadMutation.isPending ? "Uploading..." : "Submit for Review"}
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
