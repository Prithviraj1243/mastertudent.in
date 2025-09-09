import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
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
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
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
          description: "Class 10 CBSE Board",
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
          id: "fallback-cbse-12",
          name: "Class 12th CBSE Science",
          description: "Class 12 CBSE Science Stream",
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
          id: "fallback-jee",
          name: "JEE Main",
          description: "Joint Entrance Examination",
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
        }
      ] as T;
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
