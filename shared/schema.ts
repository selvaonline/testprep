import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string().nullable(),
  firebaseUid: z.string()
});

export const insertUserSchema = userSchema.omit({ id: true });

// Question schemas
export const questionSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  grade: z.number(),
  subject: z.string(),
  explanation: z.string()
});

export const insertQuestionSchema = questionSchema.omit({ id: true });

// Attempt schemas
export const attemptSchema = z.object({
  id: z.number(),
  userId: z.number(),
  questionId: z.number(),
  isCorrect: z.boolean(),
  createdAt: z.date()
});

export const insertAttemptSchema = attemptSchema.omit({ id: true, createdAt: true });

// Login data schema
export const loginDataSchema = z.object({
  username: z.string(),
  password: z.string()
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type LoginData = z.infer<typeof loginDataSchema>;
