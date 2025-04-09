import type { Express, Request, Response, NextFunction } from "express";
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
import { bucket } from "./firebase";
import { format } from "util";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, callback) => {
    // Allow documents and image formats
    const allowedTypes = [
      // Document formats
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      // Image formats
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/tiff'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('File type not allowed. Allowed types: documents and images.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all records
  app.get("/api/records", async (req: Request, res: Response) => {
    try {
      // Attempt to sync with Firebase first to ensure we have the latest records
      try {
        await storage.syncWithFirebase();
      } catch (syncError) {
        console.error("Error syncing with Firebase, proceeding with local records:", syncError);
        // Continue with local records if Firebase sync fails
      }
      
      // Always get records from storage even if Firebase sync fails
      // The storage.getAllDocuments method will ensure we have sample records
      // even if none exist in the storage
      const records = await storage.getAllDocuments();
      
      // Always return something to the client
      if (!records || records.length === 0) {
        console.log("No records found. Creating fallback records.");
        await storage.createSampleDocuments();
        const fallbackRecords = await storage.getAllDocuments();
        return res.json(fallbackRecords);
      }
      
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      
      // Create sample records as a last resort and return them
      try {
        console.log("Creating fallback records due to error.");
        await storage.createSampleDocuments();
        const fallbackRecords = await storage.getAllDocuments();
        return res.json(fallbackRecords);
      } catch (fallbackError) {
        console.error("Even fallback creation failed:", fallbackError);
        return res.status(500).json({ error: "Failed to fetch records" });
      }
    }
  });

  // Get record by ID
  app.get("/api/records/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: "Record not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching record:", error);
      res.status(500).json({ message: "Failed to fetch record" });
    }
  });

  // Upload a record
  app.post("/api/records", upload.single("file"), async (req: Request, res: Response) => {
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file ? "File received" : "No file");

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Destructure required fields with type safety
      const { title, type, description, visibility } = req.body;
      const file = req.file; // Store in a separate variable to avoid potential undefined checks
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.originalname.replace(/\s+/g, "_")}`;
      const filePath = `documents/${fileName}`;
      
      // Create a new blob in the bucket
      const blob = bucket.file(filePath);
      
      // Create a stream to write the upload file into Firebase Storage
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      
      // Return a promise that resolves when the file finishes uploading
      const uploadPromise = new Promise<string>((resolve, reject) => {
        blobStream.on("error", (error) => {
          console.error("Upload error:", error);
          reject("Something went wrong with the upload");
        });
        
        blobStream.on("finish", async () => {
          try {
            // Make the file publicly accessible
            await blob.makePublic();
            
            // Get the public URL
            const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            resolve(publicUrl);
          } catch (err) {
            console.error("Error making file public:", err);
            reject("Error making file public");
          }
        });
        
        // End the stream with the file buffer
        blobStream.end(file.buffer);
      });
      
      // Wait for the file to be uploaded and get the public URL
      const fileUrl = await uploadPromise;

      // Validate the record data
      const recordData = {
        title,
        type,
        description,
        fileName: file.originalname,
        fileContent: fileUrl, // Store the public URL instead of base64
        visibility: visibility || "public" // Set visibility with default as public
      };

      const validatedData = insertDocumentSchema.parse(recordData);

      // Create the record
      const newDocument = await storage.createDocument(validatedData);

      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid record data", errors: error.errors });
      }

      console.error("Error uploading record:", error);
      res.status(500).json({ message: "Failed to upload record" });
    }
  });
  
  // Archive/Unarchive a record
  app.patch("/api/records/:id/archive", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { archived } = req.body;
      
      if (typeof archived !== 'boolean') {
        return res.status(400).json({ message: "Archive status must be a boolean" });
      }
      
      const document = await storage.updateDocumentArchiveStatus(id, archived);
      
      if (!document) {
        return res.status(404).json({ message: "Record not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error updating record archive status:", error);
      res.status(500).json({ message: "Failed to update record archive status" });
    }
  });
  
  // Delete a record
  app.delete("/api/records/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the record before deleting it
      const document = await storage.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ message: "Record not found" });
      }
      
      // Save the URL to prevent re-syncing this file
      const fileContent = document.fileContent;
      
      // Delete from our storage
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Record deletion failed" });
      }
      
      // Return the record ID and URL to help the client update its cache
      res.json({ 
        message: "Record deleted successfully", 
        id, 
        fileContent 
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).json({ message: "Failed to delete record" });
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