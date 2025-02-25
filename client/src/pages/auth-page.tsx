import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginDataSchema, LoginData } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, googleSignIn } = useAuth();
  
  const form = useForm<LoginData>({
    resolver: zodResolver(loginDataSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const error = loginMutation.error || registerMutation.error;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side illustration */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: '#FDF8F4' }}>
          <div className="absolute left-0 bottom-0 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-48 w-full" style={{ fill: '#FFE5D9' }}>
              <path d="M0,0 L100,100 L0,100 Z" />
            </svg>
          </div>
          <div className="absolute right-0 top-0 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-48 w-full" style={{ fill: '#FFE5D9' }}>
              <path d="M100,0 L100,100 L0,0 Z" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <h2 className="text-4xl font-bold text-orange-900">Welcome to</h2>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              TestPrep
            </h1>
            <p className="text-xl text-orange-800 max-w-md">
              Your path to academic excellence with AI-powered learning
            </p>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Lets</h1>
            <h2 className="text-4xl font-bold mb-4">Start Learning</h2>
            <p className="text-gray-600 text-lg">
              Please login or sign up to continue
            </p>
          </div>

          <form onSubmit={form.handleSubmit((data) => {
            registerMutation.mutate(data);
          })} className="space-y-6">
            {error && (
              <p className="text-sm text-red-500 text-center">
                {error.message}
              </p>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  {...form.register("username")}
                  className="h-14 pl-12 rounded-2xl bg-[#f9f9f9] border-0 text-lg placeholder:text-gray-400"
                  placeholder="Your Email"
                  autoComplete="email"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <Input
                  type="password"
                  {...form.register("password")}
                  className="h-14 pl-12 rounded-2xl bg-[#f9f9f9] border-0 text-lg placeholder:text-gray-400"
                  placeholder="Your Password"
                  autoComplete="current-password"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg rounded-2xl bg-[#E67E22] hover:bg-[#D35400] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg rounded-2xl border-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              onClick={() => googleSignIn()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Google
            </Button>

            <p className="text-center text-gray-600">
              Already Have An Account?{" "}
              <button
                type="button"
                onClick={() => loginMutation.mutate(form.getValues())}
                className="text-[#E67E22] hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
