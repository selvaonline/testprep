import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Question } from "@shared/schema";
import QuestionCard from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PracticeTest() {
  const { grade, subject } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: [`/api/questions/${grade}/${subject}`],
  });

  const generateQuestionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/questions/generate", {
        grade: parseInt(grade),
        subject,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${grade}/${subject}`] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
              Grade {grade} {subject} Practice Test
            </h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions?.length || 0}
            </p>
          </header>

          {currentQuestion ? (
            <QuestionCard question={currentQuestion} onNext={() => {
              if (currentQuestionIndex < (questions?.length || 0) - 1) {
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
