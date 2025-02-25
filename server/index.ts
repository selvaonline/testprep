import "dotenv/config";
import express from 'express';
import { createServer } from "http";
import cors from 'cors';
import { setupVite } from "./vite.dev";
import { PrismaClient } from '@prisma/client';
import { registerRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 5050;
export const prisma = new PrismaClient();

async function startServer() {
  try {
    // Middleware
    app.use(cors({
      origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://testprepai-c4d71c7177be.herokuapp.com",
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Authorization'],
      credentials: true
    }));
    app.use(express.json());

    // Register all routes (including auth)
    await registerRoutes(app);

    const server = createServer(app);

    // Set up Vite middleware in development
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    }

    // Start server
    server.listen({
      port: Number(PORT),
      host: "0.0.0.0",
    }, () => {
      console.log(`[express] serving on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing HTTP server and Prisma client...');
      await prisma.$disconnect();
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

// Start the server
startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
