import type { MathPrompt, Difficulty } from '../types';

export const GRADE_4_MATH_PROMPT: MathPrompt = {
  base: `Generate a grade 4 math question following STAAR standards. The question should:
1. Be at appropriate difficulty level for grade 4
2. Include multiple choice options (A, B, C, D)
3. Have a clear correct answer
4. Include a detailed explanation
5. Focus on one core mathematical concept
6. Use age-appropriate language and scenarios
7. Include consistent units in both question and answers
8. Suggest visual representations where applicable`,

  difficultyLevels: {
    easy: "Basic operations with whole numbers and simple fractions",
    medium: "Multi-step problems with mixed operations",
    hard: "Complex word problems involving fractions and decimals"
  },

  conceptExamples: {
    "Area and Perimeter": [
      {
        question: "A rectangular room is 15 feet long and 12 feet wide. What is both its area in square feet and its perimeter in feet?",
        visual: "Show a rectangle with labeled dimensions and highlight both area and perimeter",
        difficulty: "medium" as Difficulty
      },
      {
        question: "A square garden has a perimeter of 36 feet. What is its area in square feet?",
        visual: "Draw a square with labeled side lengths",
        difficulty: "hard" as Difficulty
      }
    ],
    "Fractions and Decimals": [
      {
        question: "Which decimal is equivalent to 3/4?",
        visual: "Show decimal number line or fraction circles",
        difficulty: "medium" as Difficulty
      },
      {
        question: "If 2/5 of the students in a class of 40 are boys, how many girls are in the class?",
        visual: "Use fraction bar model to show the whole class",
        difficulty: "medium" as Difficulty
      }
    ],
    "Measurement": [
      {
        question: "How many cups are in 3 quarts if 1 quart equals 4 cups?",
        visual: "Show measurement conversion chart",
        difficulty: "easy" as Difficulty
      }
    ]
  },

  responseFormat: {
    question: "The complete question text",
    options: ["A. option1", "B. option2", "C. option3", "D. option4"],
    answer: "The correct option (A, B, C, or D)",
    explanation: "Detailed explanation of the solution",
    concept: "The mathematical concept being tested",
    grade: 4,
    subject: "Math",
    difficulty: "easy|medium|hard",
    visualHint: "Suggestion for visual representation"
  }
};
