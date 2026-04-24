import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

interface UserStats {
  notesUploaded: number;
  totalEarnings: number;
  totalDownloads: number;
  averageRating: number;
  monthlyEarnings: number;
  totalViews: number;
  activeNotes: number;
  pendingReviews: number;
  coinBalance?: number;
}

interface SubjectStats {
  subject: string;
  notesCount: number;
  earnings: number;
  downloads: number;
  averageRating: number;
}

// Initialize stats for new users
const defaultStats: UserStats = {
  notesUploaded: 0,
  totalEarnings: 0,
  totalDownloads: 0,
  averageRating: 0,
  monthlyEarnings: 0,
  totalViews: 0,
  activeNotes: 0,
  pendingReviews: 0,
  coinBalance: 0,
};

// Helper: build auth headers from Supabase session
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['x-supabase-token'] = session.access_token;
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    if (session?.user?.id) {
      headers['x-user-id'] = session.user.id;
    }
  } catch { /* ignore */ }
  // Fallback from sessionStorage
  if (!headers['x-user-id']) {
    try {
      const raw = sessionStorage.getItem('authUser');
      const u = raw ? JSON.parse(raw) : null;
      if (u?.id) headers['x-user-id'] = u.id;
    } catch { /* ignore */ }
  }
  return headers;
}

export function useUserStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fallbackUserId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = sessionStorage.getItem("authUser");
            return raw ? JSON.parse(raw)?.id : undefined;
          } catch {
            return undefined;
          }
        })()
      : undefined;
  const effectiveUserId = user?.id || fallbackUserId;

  // Fetch user stats — always sends JWT token
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats', effectiveUserId || "guest"],
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch('/api/user/stats', {
          credentials: 'include',
          headers: authHeaders,
        });
        
        if (!response.ok) {
          if (response.status === 404) return defaultStats;
          throw new Error('Failed to fetch stats');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return defaultStats;
      }
    },
    enabled: true,
    staleTime: 10000,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });

  // Fetch subject-wise stats — always sends JWT token
  const { data: subjectStats } = useQuery<SubjectStats[]>({
    queryKey: ['/api/user/subject-stats', effectiveUserId || "guest"],
    queryFn: async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch('/api/user/subject-stats', {
          credentials: 'include',
          headers: authHeaders,
        });
        
        if (!response.ok) {
          if (response.status === 404) return [];
          throw new Error('Failed to fetch subject stats');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching subject stats:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 10000,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
  });


  // Realtime refresh when user's notes are inserted/updated/deleted
  useEffect(() => {
    if (!effectiveUserId) return;

    const channelName = `user-stats-${effectiveUserId}`;

    // Remove any existing channel with this name to prevent
    // "cannot add postgres_changes callbacks after subscribe()" error
    supabase.removeChannel(supabase.channel(channelName));

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subject-stats'] });
    };

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `topper_id=eq.${effectiveUserId}` },
        invalidate
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          // Silently ignore realtime errors — polling will still keep data fresh
          console.warn('Realtime channel error, falling back to polling');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId, queryClient]);

  // Update stats after upload
  const updateStatsMutation = useMutation({
    mutationFn: async (uploadData: { subject: string; noteId: string }) => {
      const response = await fetch('/api/user/stats/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        throw new Error('Failed to update stats');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch stats
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subject-stats'] });
    },
  });

  return {
    stats: stats || defaultStats,
    subjectStats: subjectStats || [],
    isLoading,
    updateStats: updateStatsMutation.mutate,
    isUpdating: updateStatsMutation.isPending,
  };
}

// Hook for getting subject-specific chapters and units
export function useSubjectContent(subject: string) {
  const subjectChapters: Record<string, { chapters: string[], units: Record<string, string[]> }> = {
    "Mathematics": {
      chapters: [
        "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", 
        "Probability", "Number Theory", "Linear Algebra", "Discrete Mathematics"
      ],
      units: {
        "Algebra": ["Linear Equations", "Quadratic Equations", "Polynomials", "Matrices", "Determinants"],
        "Geometry": ["Coordinate Geometry", "Solid Geometry", "Plane Geometry", "Vectors", "3D Geometry"],
        "Trigonometry": ["Basic Ratios", "Identities", "Equations", "Inverse Functions", "Applications"],
        "Calculus": ["Limits", "Derivatives", "Integration", "Applications", "Differential Equations"],
        "Statistics": ["Data Analysis", "Measures of Central Tendency", "Probability Distributions", "Hypothesis Testing"],
        "Probability": ["Basic Probability", "Conditional Probability", "Random Variables", "Distributions"],
      }
    },
    "Physics": {
      chapters: [
        "Mechanics", "Thermodynamics", "Waves", "Optics", "Electricity", 
        "Magnetism", "Modern Physics", "Atomic Physics", "Nuclear Physics"
      ],
      units: {
        "Mechanics": ["Kinematics", "Dynamics", "Work & Energy", "Momentum", "Rotational Motion"],
        "Thermodynamics": ["Heat Transfer", "Laws of Thermodynamics", "Kinetic Theory", "Entropy"],
        "Waves": ["Wave Motion", "Sound Waves", "Wave Interference", "Standing Waves"],
        "Optics": ["Reflection", "Refraction", "Lenses", "Wave Optics", "Optical Instruments"],
        "Electricity": ["Electric Field", "Electric Potential", "Current", "Resistance", "Circuits"],
        "Magnetism": ["Magnetic Field", "Electromagnetic Induction", "AC Circuits", "Electromagnetic Waves"],
      }
    },
    "Chemistry": {
      chapters: [
        "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", 
        "Analytical Chemistry", "Biochemistry", "Environmental Chemistry"
      ],
      units: {
        "Organic Chemistry": ["Hydrocarbons", "Functional Groups", "Reactions", "Mechanisms", "Stereochemistry"],
        "Inorganic Chemistry": ["Periodic Table", "Chemical Bonding", "Coordination Compounds", "Metallurgy"],
        "Physical Chemistry": ["Thermodynamics", "Kinetics", "Equilibrium", "Electrochemistry", "Surface Chemistry"],
        "Analytical Chemistry": ["Qualitative Analysis", "Quantitative Analysis", "Instrumental Methods"],
      }
    },
    "Biology": {
      chapters: [
        "Cell Biology", "Genetics", "Evolution", "Ecology", "Human Physiology", 
        "Plant Biology", "Molecular Biology", "Biotechnology"
      ],
      units: {
        "Cell Biology": ["Cell Structure", "Cell Division", "Cell Metabolism", "Cell Transport"],
        "Genetics": ["Mendelian Genetics", "Molecular Genetics", "Population Genetics", "Genetic Engineering"],
        "Evolution": ["Natural Selection", "Speciation", "Phylogeny", "Evidence of Evolution"],
        "Ecology": ["Ecosystems", "Population Dynamics", "Conservation", "Environmental Issues"],
        "Human Physiology": ["Circulatory System", "Respiratory System", "Nervous System", "Digestive System"],
      }
    },
    "Computer Science": {
      chapters: [
        "Programming", "Data Structures", "Algorithms", "Database Systems", 
        "Computer Networks", "Operating Systems", "Software Engineering", "AI & ML"
      ],
      units: {
        "Programming": ["Variables & Data Types", "Control Structures", "Functions", "OOP", "Error Handling"],
        "Data Structures": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Hash Tables"],
        "Algorithms": ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms", "Graph Algorithms"],
        "Database Systems": ["SQL", "Database Design", "Normalization", "Transactions", "NoSQL"],
        "Computer Networks": ["Network Protocols", "OSI Model", "TCP/IP", "Network Security", "Wireless Networks"],
      }
    },
    "English": {
      chapters: [
        "Grammar", "Literature", "Writing", "Reading Comprehension", 
        "Poetry", "Drama", "Prose", "Language Skills"
      ],
      units: {
        "Grammar": ["Parts of Speech", "Tenses", "Voice", "Narration", "Sentence Structure"],
        "Literature": ["Fiction", "Non-fiction", "Literary Devices", "Critical Analysis"],
        "Writing": ["Essay Writing", "Letter Writing", "Report Writing", "Creative Writing"],
        "Poetry": ["Poetic Devices", "Forms of Poetry", "Analysis", "Interpretation"],
        "Drama": ["Elements of Drama", "Character Analysis", "Theme Analysis", "Dramatic Techniques"],
      }
    }
  };

  return subjectChapters[subject] || { chapters: [], units: {} };
}
