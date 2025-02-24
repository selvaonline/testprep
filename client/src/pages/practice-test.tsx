import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Redirect } from "wouter";
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
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Early return for invalid parameters
  if (!isValidParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Invalid parameters:</p>
          <p>Grade: {grade} {isValidGrade ? '✅' : '❌'}</p>
          <p>Subject: {subject} {isValidSubject ? '✅' : '❌'}</p>
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Add error display
  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading questions: {(questionsError as Error).message}</p>
      </div>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">
              Grade {gradeNum} {decodedSubject} Practice Test
            </h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {(questions || []).length}
            </p>
          </header>

          {currentQuestion ? (
            <QuestionCard question={currentQuestion} onNext={() => {
              if (questions && currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(i => i + 1);
              }
            }} />
          ) : (
            <div className="text-center space-y-4">
              <p>No questions available. Generate some questions to start practicing.</p>
              <Button
                onClick={() => generateQuestionMutation.mutate()}
                disabled={generateQuestionMutation.isPending}
              >
                {generateQuestionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Questions
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
