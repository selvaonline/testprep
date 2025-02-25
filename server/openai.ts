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
    // First check if the answer matches exactly
    const isCorrect = userAnswer === question.answer;
    
    // Get detailed explanation from GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are evaluating a student's answer to a multiple choice question.
          The student selected "${userAnswer}" and the correct answer is "${question.answer}".
          
          Provide a detailed, encouraging explanation in this format:
          {
            "isCorrect": ${isCorrect},
            "explanation": "Start with whether they are correct or incorrect, then explain why. If incorrect, explain the correct answer. Be encouraging and supportive."
          }`
        },
        {
          role: "user",
          content: `Question: ${question.question}
Options: ${question.options.join(', ')}
Concept being tested: ${question.concept}`
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
