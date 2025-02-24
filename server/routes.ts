import { createServer } from "http";
import express from "express";
import { setupAuth } from "./auth";
import { generateQuestion, evaluateAnswer, type GeneratedQuestion } from "./openai";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

export async function registerRoutes(app: express.Express) {
  setupAuth(app);

  app.get("/api/questions/:grade/:subject", async (req, res) => {
    const { grade, subject } = req.params;
    const questions = await storage.getQuestions(parseInt(grade), subject);
    res.json(questions);
  });

  app.post("/api/questions/generate", async (req, res) => {
    const { grade, subject, concept } = req.body;
    try {
      const question = await generateQuestion(grade, subject, concept);
      const savedQuestion = await storage.addQuestion(question);
      res.json(savedQuestion);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to generate question",
        error: error.message
      });
    }
  });

  app.post("/api/questions/:id/evaluate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

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
        userId: req.user!.id,
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

  app.get("/api/attempts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const attempts = await storage.getAttempts(req.user!.id);
    res.json(attempts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
