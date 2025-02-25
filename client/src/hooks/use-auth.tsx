import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

type AuthContextType = {
  user: BackendUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<BackendUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<BackendUser, Error, LoginData>;
  googleSignIn: () => Promise<void>;
};

type LoginData = {
  username: string;
  password: string;
};

type BackendUser = {
  id: number;
  username: string;
  password: string | null;
  firebaseUid: string;
};

const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get ID token to pass to backend
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        
        // Update user data in React Query cache
        queryClient.setQueryData(["/api/user"], {
          id: 0, // This will be updated when we fetch from backend
          username: firebaseUser.email || firebaseUser.displayName || firebaseUser.uid,
          password: null,
          firebaseUid: firebaseUser.uid
        });
      } else {
        localStorage.removeItem('token');
        queryClient.setQueryData(["/api/user"], null);
      }
    });

    return () => unsubscribe();
  }, []);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<BackendUser | null, Error>({
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

  const loginMutation = useMutation<BackendUser, Error, LoginData>({
    mutationFn: async (credentials) => {
      console.log('Login attempt:', { username: credentials.username });
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.username,
          credentials.password
        );
        const token = await userCredential.user.getIdToken();
        
        // Sync with backend
        const res = await apiRequest("POST", "/api/login", { 
          token,
          email: credentials.username 
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Login failed: ${res.status}`);
        }
        
        return await res.json();
      } catch (error: any) {
        throw new Error(error.message || 'Login failed');
      }
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

  const registerMutation = useMutation<BackendUser, Error, LoginData>({
    mutationFn: async (credentials) => {
      console.log('Register attempt:', { username: credentials.username });
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          credentials.username,
          credentials.password
        );
        const token = await userCredential.user.getIdToken();
        
        // Sync with backend
        const res = await apiRequest("POST", "/api/register", {
          token,
          email: credentials.username
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Registration failed: ${res.status}`);
        }
        
        return await res.json();
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed');
      }
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
      await signOut(auth);
      await apiRequest("POST", "/api/logout");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Sync with backend
      const res = await apiRequest("POST", "/api/login", {
        token,
        email: result.user.email
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync with backend');
      }
      
      toast({
        title: "Success",
        description: "Signed in with Google",
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        googleSignIn,
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
