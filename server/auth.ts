import { Request, Response, NextFunction } from "express";
import { auth } from "./lib/firebase-admin";
import { prisma } from "./lib/prisma";

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
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

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error("Auth error:", error);
    res.status(401).json({ error: error.message });
  }
}
