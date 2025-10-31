import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Phone, 
  MapPin, 
  School, 
  Calendar,
  Mail,
  Edit,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Target,
  Globe,
  Users,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AutoFillData {
  location?: {
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  demographics?: {
    ageGroup: string;
    gender: string;
    preferredLanguage: string;
  };
  education?: {
    suggestedClass: string;
    nearbySchools: string[];
    educationBoard: string;
  };
  interests?: {
    subjects: string[];
    careerGoals: string[];
    studyPreferences: string[];
  };
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  school: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  preferredLanguage: string;
  subjects: string[];
  careerGoals: string[];
  studyPreferences: string[];
}

export default function ProfileAutoFill() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillData, setAutoFillData] = useState<AutoFillData | null>(null);
  const [showAutoFill, setShowAutoFill] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: '',
    class: '',
    school: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    preferredLanguage: 'English',
    subjects: [],
    careerGoals: [],
    studyPreferences: []
  });

  // Simulate auto-fill data based on phone number
  const fetchAutoFillData = async (phoneNumber: string) => {
    setAutoFillLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock auto-fill data based on phone number patterns
    const mockData: AutoFillData = {
      location: {
        city: phoneNumber.startsWith('+91') ? getIndianCityByPhone(phoneNumber) : 'Unknown',
        state: phoneNumber.startsWith('+91') ? getIndianStateByPhone(phoneNumber) : 'Unknown',
        country: phoneNumber.startsWith('+91') ? 'India' : 'Unknown',
        pincode: generatePincode(phoneNumber)
      },
      demographics: {
        ageGroup: '15-18',
        gender: 'Prefer not to say',
        preferredLanguage: phoneNumber.startsWith('+91') ? 'Hindi/English' : 'English'
      },
      education: {
        suggestedClass: '12th Grade',
        nearbySchools: getNearbySchools(phoneNumber),
        educationBoard: phoneNumber.startsWith('+91') ? 'CBSE' : 'Unknown'
      },
      interests: {
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        careerGoals: ['Engineering', 'Medical', 'Technology'],
        studyPreferences: ['Visual Learning', 'Practice Tests', 'Video Tutorials']
      }
    };
    
    setAutoFillData(mockData);
    setAutoFillLoading(false);
    setShowAutoFill(true);
  };

  // Helper functions for mock data
  const getIndianCityByPhone = (phone: string): string => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    const index = parseInt(phone.slice(-2)) % cities.length;
    return cities[index];
  };

  const getIndianStateByPhone = (phone: string): string => {
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan'];
    const index = parseInt(phone.slice(-2)) % states.length;
    return states[index];
  };

  const generatePincode = (phone: string): string => {
    return (100000 + (parseInt(phone.slice(-6)) % 900000)).toString();
  };

  const getNearbySchools = (phone: string): string[] => {
    const schools = [
      'Delhi Public School',
      'Kendriya Vidyalaya',
      'Ryan International School',
      'DAV Public School',
      'St. Xavier\'s School',
      'Modern School',
      'Amity International School',
      'Bal Bharati Public School'
    ];
    const count = 3 + (parseInt(phone.slice(-1)) % 3);
    return schools.slice(0, count);
  };

  const handleAutoFill = () => {
    if (formData.phone) {
      fetchAutoFillData(formData.phone);
    }
  };

  const applyAutoFillData = () => {
    if (autoFillData) {
      setFormData(prev => ({
        ...prev,
        city: autoFillData.location?.city || prev.city,
        state: autoFillData.location?.state || prev.state,
        country: autoFillData.location?.country || prev.country,
        pincode: autoFillData.location?.pincode || prev.pincode,
        preferredLanguage: autoFillData.demographics?.preferredLanguage || prev.preferredLanguage,
        class: autoFillData.education?.suggestedClass || prev.class,
        subjects: autoFillData.interests?.subjects || prev.subjects,
        careerGoals: autoFillData.interests?.careerGoals || prev.careerGoals,
        studyPreferences: autoFillData.interests?.studyPreferences || prev.studyPreferences
      }));
      setShowAutoFill(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to localStorage for demo
    localStorage.setItem('userProfile', JSON.stringify(formData));
    
    setIsLoading(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
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
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Complete Your Profile
            </h1>
            <p className="text-slate-300 text-lg">
              Let us auto-fill your details based on your phone number!
            </p>
          </div>

          {/* Auto-Fill Card */}
          {formData.phone && (
            <Card className="bg-slate-800/60 backdrop-blur-md border border-purple-500/30 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                  Smart Auto-Fill
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleAutoFill}
                    disabled={autoFillLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  >
                    {autoFillLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fetching Data...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Auto-Fill Profile
                      </>
                    )}
                  </Button>
                  <p className="text-slate-300 text-sm">
                    We'll fetch location, education, and preference data based on your phone number
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto-Fill Results */}
          {showAutoFill && autoFillData && (
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-md border border-green-500/30 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  Auto-Fill Results Found!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Location Info */}
                  <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="flex items-center gap-2 text-blue-300 font-semibold mb-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>City: {autoFillData.location?.city}</p>
                      <p>State: {autoFillData.location?.state}</p>
                      <p>Country: {autoFillData.location?.country}</p>
                      <p>Pincode: {autoFillData.location?.pincode}</p>
                    </div>
                  </div>

                  {/* Education Info */}
                  <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="flex items-center gap-2 text-purple-300 font-semibold mb-2">
                      <School className="h-4 w-4" />
                      Education
                    </h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>Suggested Class: {autoFillData.education?.suggestedClass}</p>
                      <p>Board: {autoFillData.education?.educationBoard}</p>
                      <p>Nearby Schools: {autoFillData.education?.nearbySchools?.length} found</p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
                    <h4 className="flex items-center gap-2 text-orange-300 font-semibold mb-2">
                      <Target className="h-4 w-4" />
                      Interests
                    </h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>Subjects: {autoFillData.interests?.subjects?.length} suggested</p>
                      <p>Career Goals: {autoFillData.interests?.careerGoals?.length} options</p>
                      <p>Study Prefs: {autoFillData.interests?.studyPreferences?.length} types</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={applyAutoFillData}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Auto-Fill Data
                  </Button>
                  <Button
                    onClick={() => setShowAutoFill(false)}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Skip Auto-Fill
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <User className="h-6 w-6 text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-slate-300">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded-md"
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

            {/* Location Information */}
            <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <MapPin className="h-6 w-6 text-green-400" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-slate-300">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-slate-300">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-slate-300">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode" className="text-slate-300">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education Information */}
            <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <School className="h-6 w-6 text-purple-400" />
                  Education Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class" className="text-slate-300">Class/Grade</Label>
                  <select
                    id="class"
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded-md"
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
                  <Label htmlFor="school" className="text-slate-300">School/Institution</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
