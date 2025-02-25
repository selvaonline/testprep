import { Router } from "express";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/firebase-admin";
import { User } from "@shared/schema";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: email || uid,
          firebaseUid: uid,
          password: null
        },
      });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        username: email || uid,
        firebaseUid: uid,
        password: null
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.get("/user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Auth error:", error);
    res.status(401).json({ error: error.message });
  }
});

export default router;
