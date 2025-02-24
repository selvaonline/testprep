import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const res = await apiRequest('GET', '/api/user');
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        return await res.json();
      } catch (err) {
        console.error('Auth error:', err);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('Login attempt:', { username: credentials.username });
      const res = await apiRequest("POST", "/api/login", credentials) as Response;
      const data = await res.json();
      console.log('Login response:', data);
      if (!res.ok) {
        throw new Error(data.error || `Login failed: ${res.status} ${res.statusText}`);
      }
      return data as SelectUser & { token: string };
    },
    onSuccess: (response) => {
      console.log('Login success:', response);
      localStorage.setItem('token', response.token);
      queryClient.setQueryData(["/api/user"], { id: response.id, username: response.username });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log('Register attempt:', { username: credentials.username });
      const res = await apiRequest("POST", "/api/register", credentials) as Response;
      const data = await res.json();
      console.log('Register response:', data);
      if (!res.ok) {
        // Extract error message from response
        throw new Error(data.error || `Registration failed: ${res.status} ${res.statusText}`);
      }
      return data as SelectUser & { token: string };
    },
    onSuccess: (response) => {
      console.log('Register success:', response);
      localStorage.setItem('token', response.token);
      queryClient.setQueryData(["/api/user"], { id: response.id, username: response.username });
    },
    onError: (error: Error) => {
      console.error('Register error:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
