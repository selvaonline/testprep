import OpenAI from "openai";
import { generateQuestionPrompt } from "../prompts";
import type { GeneratedQuestion, Difficulty } from "../prompts/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateQuestion(
  grade: number,
  subject: string,
  concept?: string,
  difficulty: Difficulty = 'medium'
): Promise<GeneratedQuestion> {
  try {
    console.log('OpenAI: Generating question for:', { grade, type: typeof grade, subject });
    const prompt = generateQuestionPrompt(grade, subject, concept, difficulty);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const question = JSON.parse(content) as GeneratedQuestion;
    console.log('OpenAI: Generated question:', { grade: question.grade, type: typeof question.grade });
    return question;
  } catch (error: any) {
    throw new Error("Failed to generate question: " + (error.message || "Unknown error"));
  }
}

interface EvaluationResult {
  isCorrect: boolean;
  explanation: string;
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
