import type { MathPrompt, Difficulty } from '../types';

export const GRADE_3_MATH_PROMPT: MathPrompt = {
  base: `Generate a grade 3 math question following STAAR standards. The question should:
1. Be at appropriate difficulty level for grade 3
2. Include multiple choice options (A, B, C, D)
3. Have a clear correct answer
4. Include a detailed explanation
5. Focus on one core mathematical concept
6. Use age-appropriate language and scenarios
7. Include consistent units in both question and answers
8. Suggest visual representations where applicable`,

  difficultyLevels: {
    easy: "Basic concept application with small numbers and simple operations",
    medium: "Mixed operations or multi-step problems",
    hard: "Complex word problems requiring multiple steps and critical thinking"
  },

  conceptExamples: {
    "Area Calculation": [
      {
        question: "A rectangular garden has 6 rows of flowers with 8 flowers in each row. What is the area of the garden in square feet if each flower needs 1 square foot of space?",
        visual: "Draw a rectangular grid showing rows and columns of flowers",
        difficulty: "easy" as Difficulty
      },
      {
        question: "The school playground is rectangular with a length of 15 yards and width of 12 yards. What is its area in square yards?",
        visual: "Show a rectangle with labeled dimensions",
        difficulty: "medium" as Difficulty
      }
    ],
    "Multiplication": [
      {
        question: "If each student needs 3 pencils and there are 12 students, how many pencils are needed in total?",
        visual: "Show groups of pencils",
        difficulty: "easy" as Difficulty
      }
    ],
    "Fractions": [
      {
        question: "Which fraction is equivalent to 2/4?",
        visual: "Show fraction circles or bars",
        difficulty: "medium" as Difficulty
      }
    ]
  },

  responseFormat: {
    question: "The complete question text",
    options: ["A. option1", "B. option2", "C. option3", "D. option4"],
    answer: "The correct option (A, B, C, or D)",
    explanation: "Detailed explanation of the solution",
    concept: "The mathematical concept being tested",
    grade: 3,
    subject: "Math",
    difficulty: "easy|medium|hard",
    visualHint: "Suggestion for visual representation"
  }
};
