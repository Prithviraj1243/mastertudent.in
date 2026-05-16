import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, User, Loader2 } from "lucide-react";

interface TeacherCredentialsModalProps {
  noteId: string;
  noteTitle: string;
  currentTeacherId?: string;
  currentTeacherPassword?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherCredentialsModal({
  noteId,
  noteTitle,
  currentTeacherId = "",
  currentTeacherPassword = "",
  isOpen,
  onClose,
}: TeacherCredentialsModalProps) {
  const [teacherId, setTeacherId] = useState(currentTeacherId);
  const [teacherPassword, setTeacherPassword] = useState(currentTeacherPassword);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/notes/${noteId}/teacher-credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teacherId, teacherPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update credentials");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Teacher credentials updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notes"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherId.trim() || !teacherPassword.trim()) {
      toast({
        title: "Validation Error",
        description: "Both Teacher ID and Password are required",
        variant: "destructive",
      });
      return;
    }

    updateCredentialsMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-400" />
            Teacher Credentials
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Set login credentials for teachers to access: <span className="font-semibold text-slate-300">{noteTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacherId" className="text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              Teacher ID
            </Label>
            <Input
              id="teacherId"
              type="text"
              placeholder="Enter teacher ID (e.g., TEACH001)"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              disabled={updateCredentialsMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherPassword" className="text-slate-300 flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-400" />
              Teacher Password
            </Label>
            <Input
              id="teacherPassword"
              type="text"
              placeholder="Enter password for teacher access"
              value={teacherPassword}
              onChange={(e) => setTeacherPassword(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              disabled={updateCredentialsMutation.isPending}
            />
            <p className="text-xs text-slate-500">
              Teachers will use these credentials to access this note
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateCredentialsMutation.isPending}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCredentialsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateCredentialsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Credentials"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
