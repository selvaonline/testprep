import { GRADE_3_MATH_PROMPT } from './grade3/math';
import { GRADE_4_MATH_PROMPT } from './grade4/math';

type Difficulty = 'easy' | 'medium' | 'hard';

interface PromptExample {
  question: string;
  visual: string;
  difficulty: Difficulty;
}

interface MathPrompt {
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

const prompts: Record<string, Record<string, MathPrompt>> = {
  '3': {
    'Math': GRADE_3_MATH_PROMPT
  },
  '4': {
    'Math': GRADE_4_MATH_PROMPT
  }
};

export function getPrompt(grade: number, subject: string): MathPrompt {
  console.log('Getting prompt for:', { grade, type: typeof grade, subject });
  
  const gradeStr = grade.toString();
  console.log('Grade string:', { gradeStr, availableGrades: Object.keys(prompts) });
  
  const gradePrompts = prompts[gradeStr];
  if (!gradePrompts) {
    throw new Error(`No prompts found for grade ${grade} (available grades: ${Object.keys(prompts).join(', ')})`);
  }

  const prompt = gradePrompts[subject];
  if (!prompt) {
    throw new Error(`No ${subject} prompt found for grade ${grade} (available subjects: ${Object.keys(gradePrompts).join(', ')})`);
  }

  return prompt;
}

export function generateQuestionPrompt(
  grade: number,
  subject: string,
  concept?: string,
  difficulty: Difficulty = 'medium'
): string {
  console.log('Generating question prompt:', { grade, type: typeof grade, subject, concept, difficulty });
  const prompt = getPrompt(grade, subject);
  console.log('Got prompt template with response format:', prompt.responseFormat);
  const examples = concept && prompt.conceptExamples[concept]
    ? prompt.conceptExamples[concept]
        .filter(ex => ex.difficulty === difficulty)
        .map(ex => `Example: ${ex.question}\nVisual: ${ex.visual}`)
        .join('\n\n')
    : '';

  return `${prompt.base}

Difficulty Level: ${prompt.difficultyLevels[difficulty]}

${examples ? `Examples for ${concept}:\n${examples}\n` : ''}

Generate a question following this format:
${JSON.stringify(prompt.responseFormat, null, 2)}`;
}
