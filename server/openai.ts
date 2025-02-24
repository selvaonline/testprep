import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GRADE_3_MATH_PROMPT = `Generate a grade 3 math question following STAAR standards. The question should:
1. Be at appropriate difficulty level for grade 3
2. Include multiple choice options (A, B, C, D)
3. Have a clear correct answer
4. Include a detailed explanation
5. Focus on one core mathematical concept
6. Use age-appropriate language and scenarios

Format the response as a JSON object with:
{
  "question": "The complete question text",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "answer": "The correct option (A, B, C, or D)",
  "explanation": "Detailed explanation of the solution",
  "concept": "The mathematical concept being tested",
  "grade": 3,
  "subject": "Math"
}

Use examples similar to:
1. Area calculation: "A rectangular garden has 6 rows of flowers with 8 flowers in each row. What is the total number of flowers?"
2. Multiplication: "If each student needs 3 pencils and there are 12 students, how many pencils are needed in total?"
3. Fractions: "Which fraction is equivalent to 2/4?"`;

interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  concept: string;
  grade: number;
  subject: string;
}

interface EvaluationResult {
  isCorrect: boolean;
  explanation: string;
}

async function generateQuestion(grade: number, subject: string): Promise<GeneratedQuestion> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: GRADE_3_MATH_PROMPT
        },
        {
          role: "user",
          content: `Generate a ${subject} question for grade ${grade} that tests a key concept from the curriculum.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content) as GeneratedQuestion;
  } catch (error: any) {
    throw new Error("Failed to generate question: " + (error.message || "Unknown error"));
  }
}

async function evaluateAnswer(question: GeneratedQuestion, userAnswer: string): Promise<EvaluationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Evaluate if the user's answer matches the correct answer. 
          Respond with JSON in this format:
          {
            "isCorrect": boolean,
            "explanation": "Explanation of why the answer is correct or incorrect"
          }`
        },
        {
          role: "user",
          content: `Question: ${question.question}
Correct Answer: ${question.answer}
User Answer: ${userAnswer}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content) as EvaluationResult;
  } catch (error: any) {
    throw new Error("Failed to evaluate answer: " + (error.message || "Unknown error"));
  }
}

export { generateQuestion, evaluateAnswer, type GeneratedQuestion, type EvaluationResult };
