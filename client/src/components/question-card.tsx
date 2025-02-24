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
    <Card className="border-primary/20">
      <CardContent className="pt-8 space-y-8">
        <div className="space-y-4">
          <div className="text-xl font-medium leading-relaxed">{question.question}</div>
          <div className="h-[2px] w-16 bg-gradient-to-r from-primary to-primary-foreground" />
        </div>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answer === option ? "default" : "outline"}
              className={`w-full justify-start p-4 h-auto text-left transition-all duration-200 ${
                answer === option 
                  ? "bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => !showExplanation && setAnswer(option)}
              disabled={showExplanation}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm px-2 py-1 bg-black/10 rounded">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            </Button>
          ))}
        </div>

        {!showExplanation ? (
          <Button
            className={`w-full h-12 transition-all duration-200 ${
              answer 
                ? "bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90" 
                : "opacity-50"
            }`}
            onClick={() => evaluateMutation.mutate()}
            disabled={evaluateMutation.isPending || !answer}
          >
            {evaluateMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating...</span>
              </div>
            ) : (
              "Submit Answer"
            )}
          </Button>
        ) : (
          <div className="space-y-6">
            <Alert 
              variant={evaluateMutation.data?.isCorrect ? "default" : "destructive"}
              className={`border-2 ${
                evaluateMutation.data?.isCorrect 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-destructive/50 bg-destructive/10"
              }`}
            >
              <AlertDescription className="text-base leading-relaxed">
                {evaluateMutation.data?.explanation}
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
              onClick={onNext}
            >
              Next Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
