import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Camera,
  Star,
  Award,
  BookOpen,
  Heart,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function ProfileEdit() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    education: '',
    institution: '',
    graduationYear: '',
    bio: '',
    interests: '',
    subjects: '',
    goals: '',
    gender: '',
    fieldOfStudy: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    }
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        education: user.education || '',
        institution: user.institution || '',
        graduationYear: user.graduationYear || '',
        bio: user.bio || '',
        interests: user.interests || '',
        subjects: user.subjects || '',
        goals: user.goals || '',
        gender: user.gender || '',
        fieldOfStudy: user.fieldOfStudy || '',
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          twitter: user.socialLinks?.twitter || '',
          website: user.socialLinks?.website || ''
        }
      });
      setProfileImage(user.profileImage || '');
      calculateCompletion();
    }
  }, [user]);

  useEffect(() => {
    calculateCompletion();
  }, [formData]);

  const calculateCompletion = () => {
    const allFields = [
      formData.firstName, formData.lastName, formData.email, formData.phone,
      formData.dateOfBirth, formData.address, formData.city, formData.state,
      formData.education, formData.institution, formData.bio, formData.interests
    ];
    
    const completedFields = allFields.filter(field => field && field.trim() !== '');
    const percentage = Math.round((completedFields.length / allFields.length) * 100);
    setCompletionPercentage(percentage);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Here you would make an API call to update the user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'social', label: 'Social Links', icon: Star }
  ];

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'from-green-500 to-emerald-500';
    if (completionPercentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects - Matching Main Website */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${
                i % 4 === 0 ? 'w-2 h-2 bg-purple-400/20 animate-pulse' :
                i % 4 === 1 ? 'w-3 h-3 bg-cyan-400/15 animate-ping' :
                i % 4 === 2 ? 'w-1 h-1 bg-pink-400/25 animate-bounce' :
                'w-4 h-4 bg-indigo-400/10 animate-pulse'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-800">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Profile
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-white flex items-center">
                      <Edit3 className="h-8 w-8 mr-3 text-purple-400" />
                      Edit Profile
                    </h1>
                    <p className="text-gray-400">Complete your profile to unlock all features</p>
                  </div>
                </div>
                
                {/* Completion Badge */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${getCompletionColor()} bg-clip-text text-transparent`}>
                          {completionPercentage}%
                        </div>
                        <div className="text-xs text-gray-400">Complete</div>
                      </div>
                      <div className="w-16">
                        <Progress value={completionPercentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/90 border-slate-700 sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="h-5 w-5 mr-2 text-purple-400" />
                      Profile Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                            activeSection === section.id
                              ? 'bg-purple-600/20 text-purple-300 border-r-2 border-purple-500'
                              : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                          }`}
                        >
                          <section.icon className="h-4 w-4 mr-3" />
                          {section.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Profile Preview */}
                <Card className="bg-slate-800/90 border-slate-700 mt-6">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-white" />
                        )}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Camera className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    <div className="text-white font-medium">
                      {formData.firstName || formData.lastName 
                        ? `${formData.firstName} ${formData.lastName}`.trim()
                        : 'Your Name'
                      }
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formData.education || 'Education Level'}
                    </div>
                    <Badge className="mt-2 bg-purple-600/20 text-purple-300 border-purple-500/30">
                      {user?.role || 'Student'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card className="bg-slate-800/90 border-slate-700">
                  <CardContent className="p-6">
                    {/* Personal Information */}
                    {activeSection === 'personal' && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-6">
                          <User className="h-6 w-6 text-purple-400 mr-3" />
                          <h2 className="text-xl font-bold text-white">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              First Name *
                            </label>
                            <Input
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your first name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Last Name *
                            </label>
                            <Input
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your last name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Date of Birth
                            </label>
                            <Input
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Gender
                            </label>
                            <select
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                              value={formData.gender || ''}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bio
                          </label>
                          <Textarea
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Contact Details */}
                    {activeSection === 'contact' && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-6">
                          <Phone className="h-6 w-6 text-purple-400 mr-3" />
                          <h2 className="text-xl font-bold text-white">Contact Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="your.email@example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="+91 98765 43210"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Address
                            </label>
                            <Textarea
                              value={formData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your full address"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              City
                            </label>
                            <Input
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your city"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              State
                            </label>
                            <Input
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your state"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {activeSection === 'education' && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-6">
                          <GraduationCap className="h-6 w-6 text-purple-400 mr-3" />
                          <h2 className="text-xl font-bold text-white">Education Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Education Level
                            </label>
                            <select
                              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white"
                              value={formData.education}
                              onChange={(e) => handleInputChange('education', e.target.value)}
                            >
                              <option value="">Select Education Level</option>
                              <option value="high-school">High School</option>
                              <option value="undergraduate">Undergraduate</option>
                              <option value="graduate">Graduate</option>
                              <option value="postgraduate">Postgraduate</option>
                              <option value="phd">PhD</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Institution/School
                            </label>
                            <Input
                              value={formData.institution}
                              onChange={(e) => handleInputChange('institution', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter your institution name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Graduation Year
                            </label>
                            <Input
                              type="number"
                              value={formData.graduationYear}
                              onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="2024"
                              min="1950"
                              max="2030"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Field of Study
                            </label>
                            <Input
                              value={formData.fieldOfStudy || ''}
                              onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Computer Science, Medicine, etc."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preferences */}
                    {activeSection === 'preferences' && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-6">
                          <Heart className="h-6 w-6 text-purple-400 mr-3" />
                          <h2 className="text-xl font-bold text-white">Preferences & Interests</h2>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Subjects of Interest
                            </label>
                            <Textarea
                              value={formData.subjects}
                              onChange={(e) => handleInputChange('subjects', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Mathematics, Physics, Computer Science, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Hobbies & Interests
                            </label>
                            <Textarea
                              value={formData.interests}
                              onChange={(e) => handleInputChange('interests', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Reading, Coding, Sports, Music, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Learning Goals
                            </label>
                            <Textarea
                              value={formData.goals}
                              onChange={(e) => handleInputChange('goals', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="What do you want to achieve through learning?"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {activeSection === 'social' && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-6">
                          <Star className="h-6 w-6 text-purple-400 mr-3" />
                          <h2 className="text-xl font-bold text-white">Social Links</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              LinkedIn Profile
                            </label>
                            <Input
                              value={formData.socialLinks.linkedin}
                              onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              GitHub Profile
                            </label>
                            <Input
                              value={formData.socialLinks.github}
                              onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="https://github.com/username"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Twitter Profile
                            </label>
                            <Input
                              value={formData.socialLinks.twitter}
                              onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="https://twitter.com/username"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Personal Website
                            </label>
                            <Input
                              value={formData.socialLinks.website}
                              onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-slate-700">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
