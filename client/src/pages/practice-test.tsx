import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { StoredQuestion } from "@/../../prompts/types";
import QuestionCard from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PracticeTest() {
  const { grade, subject } = useParams();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();

  // Parse and validate parameters first
  const gradeNum = grade ? Math.abs(Number(grade)) : null;
  const decodedSubject = subject ? decodeURIComponent(subject) : null;
  
  // Strict validation
  const isValidGrade = typeof gradeNum === 'number' && !isNaN(gradeNum) && gradeNum > 0 && gradeNum <= 12;
  const isValidSubject = typeof decodedSubject === 'string' && decodedSubject.length > 0;
  const isValidParams = isValidGrade && isValidSubject;

  console.log('Parameter validation:', {
    rawGrade: grade,
    rawSubject: subject,
    gradeNum,
    decodedSubject,
    isValidGrade,
    isValidSubject
  });

  // Auth check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Early return for invalid parameters
  if (!isValidParams) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-destructive">Invalid Parameters</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded bg-background">
                <span>Grade: {grade}</span>
                <span className={isValidGrade ? "text-green-500" : "text-destructive"}>
                  {isValidGrade ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-background">
                <span>Subject: {subject}</span>
                <span className={isValidSubject ? "text-green-500" : "text-destructive"}>
                  {isValidSubject ? '✓' : '✗'}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="w-full hover:bg-primary/10 transition-colors"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only create query if parameters are valid
  const { data: questions, isLoading, error: questionsError } = useQuery<StoredQuestion[]>({
    queryKey: [`questions-${gradeNum}-${decodedSubject}`],
    enabled: isValidParams,
    queryFn: async () => {
      const encodedSubject = encodeURIComponent(decodedSubject);
      const url = `/api/questions/${gradeNum}/${encodedSubject}`;
      console.log('Fetching questions from:', url);
      
      const res = await apiRequest("GET", url);
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      return res.json();
    }
  });

  const generateQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!isValidGrade || !isValidSubject) {
        throw new Error(`Invalid parameters: grade=${grade}, subject=${subject}`);
      }

      const requestBody = {
        grade: Number(grade),
        subject: decodedSubject.trim(),
        count: 1
      };
      
      console.log('Generating question with:', requestBody);
      
      const res = await apiRequest("POST", "/api/questions/generate", requestBody);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Generation failed: ${errorText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`questions-${gradeNum}-${decodedSubject}`]
      });
    },
    onError: (error: Error) => {
      console.error("Failed to generate question:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate question",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading Questions...</p>
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-destructive/20 shadow-lg">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-destructive">Error Loading Questions</h2>
            <p className="text-sm text-muted-foreground">
              {(questionsError as Error).message}
            </p>
            <div className="space-x-4">
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: [`questions-${gradeNum}-${decodedSubject}`] })}
                className="hover:bg-primary/10 transition-colors"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="hover:bg-primary/10 transition-colors"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            TestPrep
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user?.username}</span>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="hover:bg-primary/10 transition-colors"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Grade {gradeNum} {decodedSubject} Practice Test
            </h2>
            <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/20 to-transparent" />
                <p className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {(questions || []).length}
                </p>
                <div className="h-[2px] flex-grow bg-gradient-to-l from-primary/20 to-transparent" />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => generateQuestionMutation.mutate()}
                  disabled={generateQuestionMutation.isPending}
                  className="bg-[#E67E23] hover:opacity-90 text-white"
                >
                  {generateQuestionMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    "Generate Questions"
                  )}
                </Button>
              </div>
            </div>
              <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-primary/20">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Correct</p>
                    <p className="text-2xl font-bold text-green-500">
                      {Object.values(answers).filter(a => a === 'correct').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Wrong</p>
                    <p className="text-2xl font-bold text-red-500">
                      {Object.values(answers).filter(a => a === 'incorrect').length}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold text-primary">
                    {Object.keys(answers).length === 0 ? '0%' : 
                      Math.round((Object.values(answers).filter(a => a === 'correct').length / Object.keys(answers).length) * 100) + '%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </header>

          {showResults ? (
            <div className="text-center space-y-6 py-12">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Practice Session Results</h3>
                <p className="text-lg">
                  You answered {Object.values(answers).filter(a => a === 'correct').length} out of {Object.keys(answers).length} questions correctly
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  onClick={() => {
                    setAnswers({});
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    generateQuestionMutation.mutate();
                  }}
                  className="bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Start New Session
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                >
                  Return Home
                </Button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6">
              <QuestionCard 
                question={currentQuestion} 
                onAnswer={(isCorrect) => {
                  setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: isCorrect ? 'correct' : 'incorrect'
                  }));
                }}
                onNext={() => {
                  generateQuestionMutation.mutate();
                  queryClient.invalidateQueries({ 
                    queryKey: [`questions-${gradeNum}-${decodedSubject}`]
                  });
                }} 
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowResults(true)}
                >
                  Stop Practice
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-12">
              <div className="space-y-3">
                <p className="text-lg font-medium">No questions available yet</p>
                <p className="text-sm text-muted-foreground">
                  Generate some questions to start practicing {decodedSubject} for Grade {gradeNum}
                </p>
              </div>
              <Button
                onClick={() => generateQuestionMutation.mutate()}
                disabled={generateQuestionMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity px-8"
              >
                {generateQuestionMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
