import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  MapPin, 
  Calendar,
  Camera,
  Save,
  X,
  Edit,
  CheckCircle,
  Sparkles,
  Globe,
  BookOpen,
  Target,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ProfileEditForm({ onSave, onCancel, initialData }: ProfileEditFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || user?.firstName || '',
    lastName: initialData?.lastName || user?.lastName || '',
    email: initialData?.email || user?.email || '',
    phone: initialData?.phone || user?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    class: initialData?.class || '',
    school: initialData?.school || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    pincode: initialData?.pincode || '',
    bio: initialData?.bio || '',
    interests: initialData?.interests || [],
    subjects: initialData?.subjects || [],
    careerGoals: initialData?.careerGoals || [],
    socialLinks: {
      linkedin: initialData?.socialLinks?.linkedin || '',
      github: initialData?.socialLinks?.github || '',
      twitter: initialData?.socialLinks?.twitter || ''
    }
  });

  useEffect(() => {
    setProfileImage(initialData?.profileImageUrl || user?.profileImageUrl || '');
  }, [initialData, user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedData = {
        ...formData,
        profileImageUrl: profileImage
      };
      
      await onSave(updatedData);
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Political Science',
    'Psychology', 'Philosophy', 'Sociology', 'Literature', 'Art'
  ];

  const careerOptions = [
    'Engineering', 'Medicine', 'Technology', 'Business', 'Research',
    'Teaching', 'Law', 'Finance', 'Design', 'Media', 'Government',
    'Entrepreneurship', 'Healthcare', 'Science', 'Arts'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Edit className="h-6 w-6 text-purple-400" />
                </motion.div>
                Edit Profile
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Complete Profile
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-400" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="w-24 h-24 border-4 border-purple-500/30 shadow-lg">
                  {profileImage && <AvatarImage src={profileImage} alt="Profile" />}
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <motion.label 
                  className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-500 transition-colors shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.label>
              </motion.div>
              <div className="text-white">
                <p className="font-medium">Upload a profile picture</p>
                <p className="text-sm text-slate-400">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-slate-300">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-slate-300">Gender</Label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded-md focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <School className="h-5 w-5 text-green-400" />
                Education
              </CardTitle>
            </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Class/Grade</Label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded-md focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              >
                <option value="">Select Class</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
            <div>
              <Label className="text-slate-300">School/Institution</Label>
              <Input
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-400" />
                Location
              </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-slate-300">State</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-slate-300">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
            <div>
              <Label className="text-slate-300">Pincode</Label>
              <Input
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-yellow-400" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-slate-300">Bio</Label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-md h-24 resize-none placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                placeholder="Tell us about yourself..."
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex gap-4 justify-end"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}
