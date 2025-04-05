import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDocumentSchema, 
  insertContactSchema, 
  insertNewsletterSchema 
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Upload a document
  app.post("/api/documents", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { title, type, description } = req.body;
      
      // Validate the document data
      const documentData = {
        title,
        type,
        description,
        fileName: req.file.originalname,
        fileContent: req.file.buffer.toString("base64")
      };
      
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Create the document
      const newDocument = await storage.createDocument(validatedData);
      
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get all board members
  app.get("/api/board-members", async (req: Request, res: Response) => {
    try {
      const boardMembers = await storage.getAllBoardMembers();
      res.json(boardMembers);
    } catch (error) {
      console.error("Error fetching board members:", error);
      res.status(500).json({ message: "Failed to fetch board members" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      
      const newSubmission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({ message: "Contact form submitted successfully", id: newSubmission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Subscribe to newsletter
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      
      const newSubscription = await storage.createNewsletterSubscription(validatedData);
      
      res.status(201).json({ message: "Subscribed to newsletter successfully", id: newSubscription.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
