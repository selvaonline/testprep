import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Redirect } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Reset form when switching between login and signup
  useEffect(() => {
    form.reset();
  }, [isLogin, form]);

  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data as InsertUser);
    }
  };

  const error = loginMutation.error || registerMutation.error;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] p-8">
      <Card className="w-full max-w-[440px] shadow-none border-none bg-white rounded-3xl">
        <CardContent className="pt-12 px-8 pb-8">
          <div className="space-y-2 mb-10">
            <h1 className="text-[40px] leading-[1.1] font-bold whitespace-pre-line">
              {isLogin ? "Welcome\nBack" : "Lets\nStart Learning"}
            </h1>
            <p className="text-lg text-[#666]">
              Please {isLogin ? "login" : "sign up"} to continue
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Input 
                    {...form.register("username")} 
                    className="h-14 px-12 rounded-2xl bg-[#f9f9f9] border-0 text-[#333] text-lg placeholder:text-[#aaa]"
                    placeholder="Your Email"
                    autoComplete="username"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")} 
                    className="h-14 px-12 rounded-2xl bg-[#f9f9f9] border-0 text-lg placeholder:text-[#aaa]"
                    placeholder="Your Password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-medium rounded-2xl bg-[#e17055] hover:bg-[#e17055]/90 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
            </Button>

            <div className="text-center my-8 text-[11px] font-medium text-[#aaa] tracking-[0.15em] uppercase">
              OR CONTINUE WITH
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full h-14 text-[15px] rounded-2xl flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-[#eee] font-medium text-[#333]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
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

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={toggleMode}
                className="text-[15px] text-[#999] hover:text-[#666] transition-colors"
              >
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <span className="text-[#666] font-medium">
                  {isLogin ? "Sign Up" : "Login"}
                </span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
