import { User, Question, Attempt, InsertUser } from "@shared/schema";
import { IStorage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getQuestions(grade: number, subject: string): Promise<Question[]>;
  addQuestion(question: Question): Promise<Question>;
  
  getAttempts(userId: number): Promise<Attempt[]>;
  addAttempt(attempt: Attempt): Promise<Attempt>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private attempts: Map<number, Attempt>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.attempts = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(grade: number, subject: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (q) => q.grade === grade && q.subject === subject
    );
  }

  async addQuestion(question: Question): Promise<Question> {
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

  async addAttempt(attempt: Attempt): Promise<Attempt> {
    const id = this.currentId++;
    const newAttempt = { ...attempt, id };
    this.attempts.set(id, newAttempt);
    return newAttempt;
  }
}

export const storage = new MemStorage();
