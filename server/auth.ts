import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(user: { id: number; username: string }) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.sendStatus(401);
    }
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};

export function setupAuth(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      const token = generateToken(user);
      res.status(201).json({
        id: user.id,
        username: user.username,
        token
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username });

      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        console.log('Login failed: Invalid credentials');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      console.log('Login successful:', { user: { id: user.id, username: user.username } });
      res.json({
        id: user.id,
        username: user.username,
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send("Login failed");
    }
  });

  app.post("/api/logout", (_req, res) => {
    res.sendStatus(200);
  });

  app.get("/api/user", verifyToken, (req: Request, res: Response) => {
    const userData = {
      id: (req as AuthenticatedRequest).user.id,
      username: (req as AuthenticatedRequest).user.username
    };
    console.log('Sending user data:', userData);
    res.json(userData);
  });
}
