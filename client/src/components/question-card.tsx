import { useState } from "react";
import { StoredQuestion } from "@/../../prompts/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuestionCardProps {
  question: StoredQuestion;
  onNext: () => void;
}

export default function QuestionCard({ question, onNext }: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/questions/${question.id}/evaluate`, {
        answer,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowExplanation(true);
      queryClient.invalidateQueries({ queryKey: ["/api/attempts"] });
    },
  });

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="text-lg font-medium">{question.question}</div>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answer === option ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => !showExplanation && setAnswer(option)}
              disabled={showExplanation}
            >
              {option}
            </Button>
          ))}
        </div>

        {!showExplanation ? (
          <Button
            className="w-full"
            onClick={() => evaluateMutation.mutate()}
            disabled={evaluateMutation.isPending || !answer}
          >
            {evaluateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert variant={evaluateMutation.data?.isCorrect ? "default" : "destructive"}>
              <AlertDescription>
                {evaluateMutation.data?.explanation}
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={onNext}>
              Next Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
