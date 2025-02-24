export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PromptExample {
  question: string;
  visual: string;
  difficulty: Difficulty;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  concept: string;
  grade: number;
  subject: string;
  difficulty: Difficulty;
  visualHint?: string;
}

export interface MathPrompt {
  base: string;
  difficultyLevels: Record<Difficulty, string>;
  conceptExamples: Record<string, PromptExample[]>;
  responseFormat: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    concept: string;
    grade: number;
    subject: string;
    difficulty: string;
    visualHint: string;
  };
}

export interface StoredQuestion extends GeneratedQuestion {
  id: number;
}

export interface EvaluationResult {
  isCorrect: boolean;
  explanation: string;
}
