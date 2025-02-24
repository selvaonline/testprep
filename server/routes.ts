import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateQuestion, evaluateAnswer } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Get questions for a grade and subject
  app.get("/api/questions/:grade/:subject", async (req, res) => {
    const { grade, subject } = req.params;
    const questions = await storage.getQuestions(parseInt(grade), subject);
    res.json(questions);
  });

  // Generate a new question
  app.post("/api/questions/generate", async (req, res) => {
    const { grade, subject } = req.body;
    const question = await generateQuestion(grade, subject);
    const savedQuestion = await storage.addQuestion(question);
    res.json(savedQuestion);
  });

  // Submit an answer for evaluation
  app.post("/api/questions/:id/evaluate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { id } = req.params;
    const { answer } = req.body;
    const questions = Array.from(storage.getQuestions(0, ""));
    const question = questions.find(q => q.id === parseInt(id));
    
    if (!question) {
      return res.status(404).send("Question not found");
    }

    const evaluation = await evaluateAnswer(question, answer);
    
    await storage.addAttempt({
      id: 0, // will be set by storage
      userId: req.user!.id,
      questionId: question.id,
      isCorrect: evaluation.isCorrect,
      createdAt: new Date()
    });

    res.json(evaluation);
  });

  // Get user attempts/progress
  app.get("/api/attempts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const attempts = await storage.getAttempts(req.user!.id);
    res.json(attempts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
