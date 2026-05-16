import { useState, useCallback } from 'react';

export interface LocationData {
  city: string;
  state: string;
  country: string;
  pincode: string;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EducationData {
  suggestedClass: string;
  nearbySchools: string[];
  educationBoard: string;
  popularSubjects: string[];
  examPatterns: string[];
}

export interface DemographicData {
  ageGroup: string;
  gender: string;
  preferredLanguage: string;
  culturalContext: string;
  economicIndicators: string[];
}

export interface InterestData {
  subjects: string[];
  careerGoals: string[];
  studyPreferences: string[];
  popularCourses: string[];
  trendingFields: string[];
}

export interface AutoFillData {
  location: LocationData;
  education: EducationData;
  demographics: DemographicData;
  interests: InterestData;
  confidence: number;
  source: string;
}

interface UsePhoneAutoFillReturn {
  isLoading: boolean;
  error: string | null;
  autoFillData: AutoFillData | null;
  fetchAutoFillData: (phoneNumber: string) => Promise<void>;
  clearData: () => void;
}

// Mock data generators based on phone number patterns
const generateLocationData = (phone: string): LocationData => {
  const phoneDigits = phone.replace(/\D/g, '');
  
  // Indian phone number patterns
  if (phone.startsWith('+91') || phoneDigits.length === 10) {
    const stateMap: Record<string, { state: string; cities: string[] }> = {
      '22': { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
      '11': { state: 'Delhi', cities: ['New Delhi', 'Delhi', 'Gurgaon', 'Noida'] },
      '80': { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'] },
      '44': { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'] },
      '33': { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'] },
      '40': { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
      '79': { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
      '14': { state: 'Punjab', cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'] }
    };
    
    const areaCode = phoneDigits.substring(0, 2);
    const stateInfo = stateMap[areaCode] || { state: 'Maharashtra', cities: ['Mumbai'] };
    const cityIndex = parseInt(phoneDigits.slice(-2)) % stateInfo.cities.length;
    const city = stateInfo.cities[cityIndex];
    
    return {
      city,
      state: stateInfo.state,
      country: 'India',
      pincode: generateIndianPincode(phoneDigits),
      timezone: 'Asia/Kolkata',
      coordinates: getIndianCityCoordinates(city)
    };
  }
  
  // Default for international numbers
  return {
    city: 'Unknown',
    state: 'Unknown',
    country: 'Unknown',
    pincode: '000000',
    timezone: 'UTC',
  };
};

const generateEducationData = (phone: string, location: LocationData): EducationData => {
  const phoneDigits = phone.replace(/\D/g, '');
  const lastDigit = parseInt(phoneDigits.slice(-1));
  
  const schoolsByState: Record<string, string[]> = {
    'Maharashtra': ['Delhi Public School', 'Kendriya Vidyalaya', 'Ryan International', 'Podar International'],
    'Delhi': ['DPS RK Puram', 'Modern School', 'St. Columba\'s School', 'Sanskriti School'],
    'Karnataka': ['Bishop Cotton School', 'National Public School', 'Clarence High School', 'Inventure Academy'],
    'Tamil Nadu': ['Padma Seshadri Bala Bhavan', 'Chettinad Vidyashram', 'Sishya School', 'Velammal School'],
    'West Bengal': ['La Martiniere', 'St. Xavier\'s Collegiate', 'South Point High School', 'Birla High School'],
    'Telangana': ['Oakridge International', 'Chirec International', 'Glendale Academy', 'Meridian School'],
    'Gujarat': ['Zydus School', 'Anand Niketan', 'Udgam School', 'Calorx Public School'],
    'Punjab': ['The Doon School Dehradun', 'Mayo College', 'Welham Boys School', 'St. John\'s High School']
  };
  
  const schools = schoolsByState[location.state] || schoolsByState['Maharashtra'];
  const nearbySchools = schools.slice(0, 3 + (lastDigit % 3));
  
  const classes = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const suggestedClass = classes[lastDigit % classes.length];
  
  const boards = ['CBSE', 'ICSE', 'State Board'];
  const educationBoard = boards[lastDigit % boards.length];
  
  return {
    suggestedClass,
    nearbySchools,
    educationBoard,
    popularSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
    examPatterns: ['JEE Main', 'NEET', 'CBSE Board', 'State Entrance']
  };
};

const generateDemographicData = (phone: string, location: LocationData): DemographicData => {
  const phoneDigits = phone.replace(/\D/g, '');
  const lastTwoDigits = parseInt(phoneDigits.slice(-2));
  
  const languageByState: Record<string, string> = {
    'Maharashtra': 'Marathi/English',
    'Delhi': 'Hindi/English',
    'Karnataka': 'Kannada/English',
    'Tamil Nadu': 'Tamil/English',
    'West Bengal': 'Bengali/English',
    'Telangana': 'Telugu/English',
    'Gujarat': 'Gujarati/English',
    'Punjab': 'Punjabi/English'
  };
  
  return {
    ageGroup: '15-18',
    gender: 'Prefer not to say',
    preferredLanguage: languageByState[location.state] || 'English',
    culturalContext: location.state,
    economicIndicators: ['Middle Class', 'Urban', 'Tech-Savvy']
  };
};

const generateInterestData = (phone: string, education: EducationData): InterestData => {
  const phoneDigits = phone.replace(/\D/g, '');
  const lastDigit = parseInt(phoneDigits.slice(-1));
  
  const subjectGroups = [
    ['Mathematics', 'Physics', 'Chemistry'], // Science
    ['Biology', 'Chemistry', 'Physics'], // Medical
    ['Mathematics', 'Computer Science', 'Physics'], // Engineering
    ['English', 'History', 'Political Science'], // Humanities
    ['Economics', 'Business Studies', 'Accountancy'] // Commerce
  ];
  
  const careerGroups = [
    ['Engineering', 'Technology', 'Research'],
    ['Medicine', 'Healthcare', 'Biotechnology'],
    ['Software Development', 'Data Science', 'AI/ML'],
    ['Literature', 'Journalism', 'Teaching'],
    ['Business', 'Finance', 'Entrepreneurship']
  ];
  
  const studyPrefs = [
    ['Visual Learning', 'Interactive Content', 'Video Tutorials'],
    ['Practice Tests', 'Mock Exams', 'Question Banks'],
    ['Group Study', 'Discussion Forums', 'Peer Learning'],
    ['Self-Paced', 'Structured Learning', 'Flexible Schedule']
  ];
  
  const groupIndex = lastDigit % subjectGroups.length;
  
  return {
    subjects: subjectGroups[groupIndex],
    careerGoals: careerGroups[groupIndex],
    studyPreferences: studyPrefs[lastDigit % studyPrefs.length],
    popularCourses: ['JEE Preparation', 'NEET Coaching', 'Board Exam Prep'],
    trendingFields: ['Artificial Intelligence', 'Data Science', 'Renewable Energy', 'Biotechnology']
  };
};

// Helper functions
const generateIndianPincode = (phoneDigits: string): string => {
  const base = parseInt(phoneDigits.slice(-6)) % 900000;
  return (100000 + base).toString();
};

const getIndianCityCoordinates = (city: string): { lat: number; lng: number } => {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 }
  };
  
  return coordinates[city] || coordinates['Mumbai'];
};

export const usePhoneAutoFill = (): UsePhoneAutoFillReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoFillData, setAutoFillData] = useState<AutoFillData | null>(null);

  const fetchAutoFillData = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please provide a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Generate mock data based on phone number
      const location = generateLocationData(phoneNumber);
      const education = generateEducationData(phoneNumber, location);
      const demographics = generateDemographicData(phoneNumber, location);
      const interests = generateInterestData(phoneNumber, education);

      const data: AutoFillData = {
        location,
        education,
        demographics,
        interests,
        confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
        source: 'Phone Number Analysis + Regional Database'
      };

      setAutoFillData(data);
    } catch (err) {
      setError('Failed to fetch auto-fill data. Please try again.');
      console.error('Auto-fill error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setAutoFillData(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    autoFillData,
    fetchAutoFillData,
    clearData
  };
};
