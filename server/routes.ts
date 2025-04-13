import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertUserProgressSchema, 
  insertExtractedTextSchema, 
  insertUserActivityHistorySchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import fs from "fs";

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Users routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Languages routes
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get languages" });
    }
  });
  
  // User Progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });
  
  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      const existingProgress = await storage.getUserProgressByLanguage(userId, progressData.languageId);
      if (existingProgress) {
        return res.status(409).json({ message: "Progress for this language already exists" });
      }
      
      const progress = await storage.createUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user progress" });
    }
  });
  
  app.patch("/api/users/:userId/progress/:progressId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressId = parseInt(req.params.progressId);
      
      if (isNaN(userId) || isNaN(progressId)) {
        return res.status(400).json({ message: "Invalid user ID or progress ID" });
      }
      
      const progress = await storage.updateUserProgress(progressId, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });
  
  app.get("/api/activities/:type", async (req, res) => {
    try {
      const type = req.params.type;
      if (!type) {
        return res.status(400).json({ message: "Activity type is required" });
      }
      
      const activities = await storage.getActivitiesByType(type);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities by type" });
    }
  });
  
  // User Activity History routes
  app.post("/api/users/:userId/activity-history", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const historyData = insertUserActivityHistorySchema.parse({
        ...req.body,
        userId
      });
      
      const history = await storage.createUserActivityHistory(historyData);
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid history data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity history" });
    }
  });
  
  app.patch("/api/users/:userId/activity-history/:historyId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const historyId = parseInt(req.params.historyId);
      
      if (isNaN(userId) || isNaN(historyId)) {
        return res.status(400).json({ message: "Invalid user ID or history ID" });
      }
      
      const history = await storage.updateUserActivityHistory(historyId, req.body);
      if (!history) {
        return res.status(404).json({ message: "Activity history not found" });
      }
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to update activity history" });
    }
  });
  
  // Extracted Text routes
  app.get("/api/users/:userId/extracted-texts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const texts = await storage.getExtractedTexts(userId);
      res.json(texts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get extracted texts" });
    }
  });
  
  app.post(
    "/api/users/:userId/extracted-texts", 
    upload.single('image'),
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        
        if (!req.file && !req.body.text) {
          return res.status(400).json({ message: "Either image or text is required" });
        }
        
        let imageUrl = undefined;
        if (req.file) {
          // In a real application, we might upload this to cloud storage
          // For now, just use the local path
          imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const textData = insertExtractedTextSchema.parse({
          userId,
          languageId: req.body.languageId,
          text: req.body.text || "Text will be extracted from image",
          imageUrl
        });
        
        const extractedText = await storage.createExtractedText(textData);
        res.status(201).json(extractedText);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid text data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to create extracted text" });
      }
    }
  );
  
  // Games routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to get games" });
    }
  });
  
  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game" });
    }
  });

  // Create HTTP server and return it
  const httpServer = createServer(app);
  return httpServer;
}
