import { createServer } from "http";
import express, { Request, Response } from "express";
import { setupAuth, verifyToken } from "./auth";
import { generateQuestion, evaluateAnswer, type GeneratedQuestion } from "./openai";
import { storage } from "./storage";
import { AuthenticatedRequest } from "./types";

export async function registerRoutes(app: express.Express) {
  setupAuth(app);

  app.get("/api/questions/:grade/:subject", verifyToken, async (req: Request, res: Response) => {
    const { grade, subject } = req.params;
    console.log('GET questions params:', { grade, subject, types: { grade: typeof grade, subject: typeof subject } });
    
    const parsedGrade = parseInt(grade);
    const decodedSubject = decodeURIComponent(subject);
    
    if (isNaN(parsedGrade) || parsedGrade <= 0) {
      return res.status(400).json({
        message: "Invalid grade parameter",
        error: `Grade must be a positive number, received: ${grade}`
      });
    }

    if (!decodedSubject || typeof decodedSubject !== 'string' || !decodedSubject.trim()) {
      return res.status(400).json({
        message: "Invalid subject parameter",
        error: `Subject must be a non-empty string, received: ${subject}`
      });
    }

    console.log('GET questions:', { parsedGrade, decodedSubject });
    const questions = await storage.getQuestions(parsedGrade, decodedSubject);
    res.json(questions);
  });

  app.post("/api/questions/generate", verifyToken, async (req: Request, res: Response) => {
    console.log('Generate request body (raw):', req.body);
    
    const { grade, subject, concept } = req.body;
    
    // Validate parameters
    const parsedGrade = Number(grade);
    if (isNaN(parsedGrade) || parsedGrade <= 0) {
      console.log('Invalid grade:', { grade, parsedGrade, type: typeof grade });
      return res.status(400).json({
        message: "Invalid grade parameter",
        error: `Grade must be a positive number, received: ${grade} (${typeof grade})`
      });
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      console.log('Invalid subject:', { subject, type: typeof subject });
      return res.status(400).json({
        message: "Invalid subject parameter",
        error: `Subject must be a non-empty string, received: ${subject} (${typeof subject})`
      });
    }

    console.log('Generate request (parsed):', { parsedGrade, subject, concept });
    
    try {
      console.log('Generating question with:', { parsedGrade, subject, concept });
      const question = await generateQuestion(parsedGrade, subject, concept);
      const savedQuestion = await storage.addQuestion(question);
      res.json(savedQuestion);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to generate question",
        error: error.message
      });
    }
  });

  app.post("/api/questions/:id/evaluate", verifyToken, async (req: Request, res: Response) => {

    const { id } = req.params;
    const { answer } = req.body;

    try {
      const questions = await storage.getQuestions(0, "");
      const question = questions.find((q) => q.id === parseInt(id));
      
      if (!question) {
        return res.status(404).send("Question not found");
      }

      const evaluation = await evaluateAnswer(question, answer);

      const attempt = await storage.addAttempt({
        userId: (req as AuthenticatedRequest).user.id,
        questionId: question.id,
        isCorrect: evaluation.isCorrect,
        createdAt: new Date(),
      });

      res.json(evaluation);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to evaluate answer",
        error: error.message
      });
    }
  });

  app.get("/api/attempts", verifyToken, async (req: Request, res: Response) => {
    const attempts = await storage.getAttempts((req as AuthenticatedRequest).user.id);
    res.json(attempts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
