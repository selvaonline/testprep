import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from "http";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { setupVite } from "./vite.dev";

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET!;

// Middleware
app.use(cors({
  credentials: false
}));
app.use(express.json());

// Basic user interface + in-memory store
interface User {
  id: number;
  username: string;
  password: string; // hashed password
}
let users: User[] = [];
let userIdCounter = 1;

// Extended request type for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: User;
}

// JWT authentication middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  // Expect "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    // We stored user.id and user.username in the token
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  });
};

// API Routes
app.get('/api/user', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id, username } = req.user!;
  res.json({ id, username });
});

app.post('/api/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = { id: userIdCounter++, username, password: hashedPassword };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ id: newUser.id, username: newUser.username, token });
});

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ id: user.id, username: user.username, token });
});

app.get('/api/attempts', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ attempts: [] });
});

app.get('/api/questions/:category/:difficulty', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { category, difficulty } = req.params;
  res.json({ question: `Sample question in ${category} at ${difficulty} level` });
});

app.post('/api/questions/generate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ question: 'What is 2 + 2?', answer: 4 });
});

(async () => {
  const server = createServer(app);

  // Set up Vite middleware in development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }

  server.listen({
    port: Number(PORT),
    host: "0.0.0.0",
  }, () => {
    console.log(`[express] serving on port ${PORT}`);
  });
})().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
