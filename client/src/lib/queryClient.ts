import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to get x-user-id from sessionStorage (set during login)
function getStoredUserId(): string | null {
  try {
    const stored = sessionStorage.getItem('authUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.id || null;
    }
  } catch {}
  return null;
}

// Helper to get Supabase access token from localStorage (works even when DB is down)
function getSupabaseToken(): string | null {
  try {
    // Supabase stores the session in localStorage with a key pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase') && key.includes('auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?.access_token || parsed?.session?.access_token || null;
        }
      }
    }
  } catch {}
  return null;
}

// Build auth headers for all API requests
function buildAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const userId = getStoredUserId();
  if (userId) headers['x-user-id'] = userId;
  const token = getSupabaseToken();
  if (token) headers['x-supabase-token'] = token;
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers = buildAuthHeaders(data ? { "Content-Type": "application/json" } : {});

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = buildAuthHeaders();

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    // PRODUCTION FIX: Force fallback categories if educational-categories returns empty array
    const url = queryKey.join("/");
    if (url === '/api/educational-categories' && Array.isArray(data) && data.length === 0) {
      return [
        // School Categories
        {
          id: "fallback-cbse-9",
          name: "Class 9th CBSE",
          description: "Class 9 CBSE Board",
          categoryType: "school",
          classLevel: "9",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 10,
          icon: "📔",
          color: "#3B82F6",
          createdAt: null
        },
        {
          id: "fallback-cbse-10",
          name: "Class 10th CBSE",
          description: "Class 10 CBSE Board with Board Exams",
          categoryType: "school",
          classLevel: "10",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 13,
          icon: "📕",
          color: "#3B82F6",
          createdAt: null
        },
        {
          id: "fallback-cbse-11-sci",
          name: "Class 11th CBSE Science",
          description: "Class 11 CBSE Science Stream (PCM/PCB)",
          categoryType: "school",
          classLevel: "11",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 16,
          icon: "🔬",
          color: "#F59E0B",
          createdAt: null
        },
        {
          id: "fallback-cbse-12-sci",
          name: "Class 12th CBSE Science",
          description: "Class 12 CBSE Science Stream (PCM/PCB)",
          categoryType: "school",
          classLevel: "12",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 20,
          icon: "🎓",
          color: "#F59E0B",
          createdAt: null
        },
        {
          id: "fallback-cbse-11-comm",
          name: "Class 11th CBSE Commerce",
          description: "Class 11 CBSE Commerce Stream",
          categoryType: "school",
          classLevel: "11",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 17,
          icon: "💼",
          color: "#F59E0B",
          createdAt: null
        },
        {
          id: "fallback-cbse-12-comm",
          name: "Class 12th CBSE Commerce",
          description: "Class 12 CBSE Commerce Stream",
          categoryType: "school",
          classLevel: "12",
          board: "CBSE",
          examType: null,
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 21,
          icon: "📈",
          color: "#F59E0B",
          createdAt: null
        },
        // Competitive Exam Categories - Entrance Exams
        {
          id: "fallback-jee-main",
          name: "JEE Main",
          description: "Joint Entrance Examination - Main",
          categoryType: "competitive_exam",
          classLevel: null,
          board: null,
          examType: "JEE_Main",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 30,
          icon: "⚙️",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-jee-adv",
          name: "JEE Advanced",
          description: "Joint Entrance Examination - Advanced",
          categoryType: "competitive_exam",
          classLevel: null,
          board: null,
          examType: "JEE_Advanced",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 31,
          icon: "🎯",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-neet",
          name: "NEET UG",
          description: "National Eligibility cum Entrance Test - Undergraduate",
          categoryType: "competitive_exam",
          classLevel: null,
          board: null,
          examType: "NEET_UG",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 32,
          icon: "🩺",
          color: "#7C3AED",
          createdAt: null
        },
        {
          id: "fallback-cuet-ug",
          name: "CUET UG",
          description: "Common University Entrance Test - Undergraduate",
          categoryType: "competitive_exam",
          classLevel: null,
          board: null,
          examType: "CUET_UG",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 33,
          icon: "🎓",
          color: "#7C3AED",
          createdAt: null
        },
        {
          id: "fallback-cuet-pg",
          name: "CUET PG",
          description: "Common University Entrance Test - Postgraduate",
          categoryType: "competitive_exam",
          classLevel: null,
          board: null,
          examType: "CUET_PG",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 34,
          icon: "📚",
          color: "#7C3AED",
          createdAt: null
        },
        // Professional Exam Categories - Government & Banking  
        {
          id: "fallback-upsc",
          name: "UPSC CSE",
          description: "Union Public Service Commission - Civil Services Examination",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "UPSC_CSE",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 40,
          icon: "🏛️",
          color: "#DC2626",
          createdAt: null
        },
        {
          id: "fallback-ssc-cgl",
          name: "SSC CGL",
          description: "Staff Selection Commission - Combined Graduate Level",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "SSC_CGL",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 35,
          icon: "📝",
          color: "#7C2D12",
          createdAt: null
        },
        {
          id: "fallback-ssc-chsl",
          name: "SSC CHSL",
          description: "Staff Selection Commission - Combined Higher Secondary Level",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "SSC_CHSL",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 36,
          icon: "📊",
          color: "#7C2D12",
          createdAt: null
        },
        {
          id: "fallback-sbi-po",
          name: "SBI PO",
          description: "State Bank of India - Probationary Officer",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "SBI_PO",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 45,
          icon: "🏦",
          color: "#1E40AF",
          createdAt: null
        },
        {
          id: "fallback-ibps-po",
          name: "IBPS PO",
          description: "Institute of Banking Personnel Selection - Probationary Officer",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "IBPS_PO",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 46,
          icon: "💳",
          color: "#1E40AF",
          createdAt: null
        },
        {
          id: "fallback-rbi",
          name: "RBI Grade B",
          description: "Reserve Bank of India - Grade B Officer",
          categoryType: "professional_exam",
          classLevel: null,
          board: null,
          examType: "RBI_Grade_B",
          engineeringBranch: null,
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 47,
          icon: "🏛️",
          color: "#1E40AF",
          createdAt: null
        },
        // College Categories - Engineering & Medical
        {
          id: "fallback-cse",
          name: "Computer Science Engineering",
          description: "Computer Science and Engineering Branch",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: "Computer_Science",
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 50,
          icon: "💻",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-ece",
          name: "Electronics & Communication Engineering",
          description: "Electronics and Communication Engineering Branch",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: "Electronics_Communication",
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 51,
          icon: "📡",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-mech",
          name: "Mechanical Engineering",
          description: "Mechanical Engineering Branch",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: "Mechanical",
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 52,
          icon: "⚙️",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-civil",
          name: "Civil Engineering",
          description: "Civil Engineering Branch",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: "Civil",
          medicalBranch: null,
          subjects: null,
          isActive: true,
          displayOrder: 53,
          icon: "🏗️",
          color: "#059669",
          createdAt: null
        },
        {
          id: "fallback-mbbs-gen",
          name: "MBBS General Medicine",
          description: "Bachelor of Medicine and Bachelor of Surgery - General Medicine",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: null,
          medicalBranch: "General_Medicine",
          subjects: null,
          isActive: true,
          displayOrder: 60,
          icon: "🩺",
          color: "#7C3AED",
          createdAt: null
        },
        {
          id: "fallback-mbbs-surg",
          name: "MBBS Surgery",
          description: "Bachelor of Medicine and Bachelor of Surgery - Surgery Specialization",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: null,
          medicalBranch: "Surgery",
          subjects: null,
          isActive: true,
          displayOrder: 61,
          icon: "🔬",
          color: "#7C3AED",
          createdAt: null
        },
        {
          id: "fallback-mbbs-ped",
          name: "MBBS Pediatrics",
          description: "Bachelor of Medicine and Bachelor of Surgery - Pediatrics Specialization",
          categoryType: "college",
          classLevel: null,
          board: null,
          examType: null,
          engineeringBranch: null,
          medicalBranch: "Pediatrics",
          subjects: null,
          isActive: true,
          displayOrder: 62,
          icon: "👶",
          color: "#7C3AED",
          createdAt: null
        }
      ];
    }
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
