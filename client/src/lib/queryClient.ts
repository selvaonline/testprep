import { QueryClient } from "@tanstack/react-query";

// Ensure API URL ends with /api
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5050/api' : '/api';

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Remove /api prefix if it exists in the endpoint since it's already in the base URL
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    console.log(`Making ${method} request to:`, url, { headers });
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });

    // Log response details for debugging
    console.log(`Response from ${url}:`, {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (res.status === 401) {
      console.log('Unauthorized request, clearing token');
      localStorage.removeItem('token');
      queryClient.setQueryData(["/api/user"], null);
      // Don't throw here, let the caller handle the 401
      return res;
    }

    // For other non-200 responses, parse error message
    if (!res.ok) {
      let errorMessage: string;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || `Request failed with status ${res.status}`;
      } catch {
        errorMessage = await res.text() || `Request failed with status ${res.status}`;
      }
      console.error(`API Error (${res.status}):`, errorMessage);
      throw new Error(errorMessage);
    }

    return res;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});
