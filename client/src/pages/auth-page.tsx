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
    <div className="min-h-screen flex">
      {/* Left side illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FDF8F4] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-orange-300 rounded-full blur-2xl opacity-40" />
        <div className="relative z-10 text-center space-y-6">
          <h2 className="text-4xl font-bold text-orange-900">Welcome to</h2>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            TestPrep
          </h1>
          <p className="text-xl text-orange-800">
            Your path to academic excellence
          </p>
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
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-4 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg rounded-2xl border-2 hover:bg-gray-50 transition-colors"
              onClick={() => googleSignIn()}
            >
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
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
