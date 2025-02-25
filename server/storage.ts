import type { StoredQuestion, GeneratedQuestion } from "../prompts/types";

interface User {
  id: number;
  username: string;
  password: string;
}

interface Attempt {
  id: number;
  userId: number;
  questionId: number;
  isCorrect: boolean;
  createdAt: Date;
}

export class MemStorage {
  private users: Map<number, User>;
  private questions: Map<number, StoredQuestion>;
  private attempts: Map<number, Attempt>;
  private currentId: number;
  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.attempts = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      console.log('Storage: Getting user by id:', { id, user });
      return user;
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.username === username
    );
    if (user) {
      console.log('Storage: Getting user by username:', { username, user });
      return user;
    }
    return undefined;
  }

  async createUser(insertUser: Omit<User, "id">): Promise<User> {
    const id = this.currentId++;
    const user = {
      id,
      username: insertUser.username,
      password: insertUser.password,
    };
    console.log('Storage: Creating user:', { user });
    this.users.set(id, user);
    return user;
  }

  async getQuestions(grade: number, subject: string): Promise<StoredQuestion[]> {
    const parsedGrade = Number(grade);
    console.log('Storage: Getting questions for:', { grade: parsedGrade, type: typeof parsedGrade, subject });
    return Array.from(this.questions.values()).filter(
      (q) => q.grade === parsedGrade && q.subject.toLowerCase() === subject.toLowerCase()
    );
  }

  async getQuestionById(id: number): Promise<StoredQuestion | undefined> {
    console.log('Storage: Getting question by id:', { id });
    return this.questions.get(id);
  }

  async addQuestion(question: GeneratedQuestion): Promise<StoredQuestion> {
    const parsedGrade = Number(question.grade);
    console.log('Storage: Adding question:', { grade: parsedGrade, type: typeof parsedGrade });
    const id = this.currentId++;
    const newQuestion: StoredQuestion = { 
      ...question,
      id,
      grade: parsedGrade,
      subject: question.subject.toLowerCase()
    };
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
