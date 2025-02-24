import session from "express-session";
import createMemoryStore from "memorystore";
import type { GeneratedQuestion } from "./openai";

const MemoryStore = createMemoryStore(session);

interface User {
  id: number;
  username: string;
  password: string;
}

interface StoredQuestion extends GeneratedQuestion {
  id: number;
}

interface Attempt {
  id: number;
  userId: number;
  questionId: number;
  isCorrect: boolean;
  createdAt: Date;
}

class MemStorage {
  private users: Map<number, User>;
  private questions: Map<number, StoredQuestion>;
  private attempts: Map<number, Attempt>;
  private currentId: number;
  readonly sessionStore: ReturnType<typeof createMemoryStore>;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.attempts = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: Omit<User, "id">): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(grade: number, subject: string): Promise<StoredQuestion[]> {
    return Array.from(this.questions.values()).filter(
      (q) => q.grade === grade && q.subject === subject
    );
  }

  async addQuestion(question: GeneratedQuestion): Promise<StoredQuestion> {
    const id = this.currentId++;
    const newQuestion = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async getAttempts(userId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter(
      (a) => a.userId === userId
    );
  }

  async addAttempt(attempt: Omit<Attempt, "id">): Promise<Attempt> {
    const id = this.currentId++;
    const newAttempt = { ...attempt, id };
    this.attempts.set(id, newAttempt);
    return newAttempt;
  }
}

export const storage = new MemStorage();
