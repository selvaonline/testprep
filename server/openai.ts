import OpenAI from "openai";
import { Question } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestion(grade: number, subject: string): Promise<Question> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a ${subject} question for grade ${grade} students. 
          The response should be a JSON object with the following format:
          {
            "question": "The question text",
            "answer": "The correct answer",
            "explanation": "Detailed explanation of the answer",
            "grade": ${grade},
            "subject": "${subject}"
          }`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as Question;
  } catch (error) {
    throw new Error("Failed to generate question: " + error.message);
  }
}

export async function evaluateAnswer(question: Question, userAnswer: string): Promise<{
  isCorrect: boolean;
  explanation: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Evaluate if the user's answer is correct for this question. Respond with JSON in this format:
          {
            "isCorrect": boolean,
            "explanation": "Explanation of why the answer is correct or incorrect"
          }`
        },
        {
          role: "user",
          content: `Question: ${question.question}\nCorrect Answer: ${question.answer}\nUser Answer: ${userAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error("Failed to evaluate answer: " + error.message);
  }
}
