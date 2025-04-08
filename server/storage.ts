import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  boardMembers, type BoardMember, type InsertBoardMember,
  contactSubmissions, type ContactSubmission, type InsertContact,
  newsletterSubscriptions, type NewsletterSubscription, type InsertNewsletter
} from "@shared/schema";
import { bucket } from "./firebase";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentArchiveStatus(id: number, archived: boolean): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  syncWithFirebase(): Promise<void>; // New method to sync with Firebase
  
  // Board member methods
  getAllBoardMembers(): Promise<BoardMember[]>;
  getBoardMemberById(id: number): Promise<BoardMember | undefined>;
  createBoardMember(boardMember: InsertBoardMember): Promise<BoardMember>;
  
  // Contact form methods
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletter): Promise<NewsletterSubscription>;
}

import * as fs from 'fs';
import * as path from 'path';
import { format } from "util";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private boardMembers: Map<number, BoardMember>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  currentId: number;
  currentDocumentId: number;
  currentBoardMemberId: number;
  currentContactId: number;
  currentNewsletterId: number;
  private dataDir: string;
  private documentStoragePath: string;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.boardMembers = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscriptions = new Map();
    this.currentId = 1;
    this.currentDocumentId = 1;
    this.currentBoardMemberId = 1;
    this.currentContactId = 1;
    this.currentNewsletterId = 1;
    
    // Setup persistent storage
    this.dataDir = path.join(process.cwd(), 'data');
    this.documentStoragePath = path.join(this.dataDir, 'documents.json');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Load documents from file if it exists
    this.loadDocuments();
    
    // Initialize with default board members
    this.initializeBoardMembers();
    
    // Sync with Firebase
    this.syncWithFirebase().catch((err: Error) => {
      console.error("Error syncing with Firebase:", err);
    });
  }
  
  // Save documents to file
  private saveDocuments() {
    const documentsArray = Array.from(this.documents.values());
    fs.writeFileSync(this.documentStoragePath, JSON.stringify(documentsArray, null, 2));
  }
  
  // Load documents from file
  private loadDocuments() {
    try {
      if (fs.existsSync(this.documentStoragePath)) {
        const fileData = fs.readFileSync(this.documentStoragePath, 'utf8');
        const documents: Document[] = JSON.parse(fileData);
        
        // Find the highest ID to set the counter correctly
        let maxId = 0;
        
        documents.forEach(doc => {
          // Convert string dates back to Date objects
          doc.uploadDate = new Date(doc.uploadDate);
          
          this.documents.set(doc.id, doc);
          if (doc.id > maxId) {
            maxId = doc.id;
          }
        });
        
        // Set the counter to one more than the highest ID
        this.currentDocumentId = maxId + 1;
        
        console.log(`Loaded ${documents.length} documents from storage`);
      }
    } catch (error) {
      console.error('Error loading documents from file:', error);
    }
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    // Ensure visibility is set, defaulting to "public" if not provided
    const visibility = insertDocument.visibility || "public";
    
    const document: Document = { 
      ...insertDocument, 
      visibility, // Explicitly set visibility
      id, 
      uploadDate: new Date(),
      archived: false // Explicitly set archived to false for new documents
    };
    this.documents.set(id, document);
    
    // Save documents to file for persistence
    this.saveDocuments();
    
    return document;
  }
  
  // Update document archive status
  async updateDocumentArchiveStatus(id: number, archived: boolean): Promise<Document | undefined> {
    const document = this.documents.get(id);
    
    if (!document) {
      return undefined;
    }
    
    // Update the archive status
    const updatedDocument: Document = {
      ...document,
      archived
    };
    
    // Save the updated document
    this.documents.set(id, updatedDocument);
    
    // Save documents to file for persistence
    this.saveDocuments();
    
    return updatedDocument;
  }
  
  // Delete document
  async deleteDocument(id: number): Promise<boolean> {
    const document = this.documents.get(id);
    
    if (!document) {
      return false;
    }
    
    // Delete the document from our map
    const success = this.documents.delete(id);
    
    if (success) {
      // Save documents to file for persistence
      this.saveDocuments();
      
      // TODO: If needed, also delete from Firebase Storage
      // But for now we'll keep the file in Firebase and just remove from our list
    }
    
    return success;
  }
  
  // Board member methods
  async getAllBoardMembers(): Promise<BoardMember[]> {
    return Array.from(this.boardMembers.values());
  }
  
  async getBoardMemberById(id: number): Promise<BoardMember | undefined> {
    return this.boardMembers.get(id);
  }
  
  async createBoardMember(insertBoardMember: InsertBoardMember): Promise<BoardMember> {
    const id = this.currentBoardMemberId++;
    const boardMember: BoardMember = { ...insertBoardMember, id };
    this.boardMembers.set(id, boardMember);
    return boardMember;
  }
  
  // Contact form methods
  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    
    // Create the contact with proper typing
    const contact: ContactSubmission = {
      id,
      firstName: insertContact.firstName,
      lastName: insertContact.lastName,
      email: insertContact.email,
      phone: insertContact.phone ?? null,
      address: insertContact.address ?? null,
      subject: insertContact.subject,
      message: insertContact.message,
      isPropertyOwner: insertContact.isPropertyOwner ?? false,
      submissionDate: new Date()
    };
    
    this.contactSubmissions.set(id, contact);
    return contact;
  }
  
  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletter): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existingSubscription = Array.from(this.newsletterSubscriptions.values()).find(
      (sub) => sub.email === insertSubscription.email
    );
    
    if (existingSubscription) {
      return existingSubscription;
    }
    
    const id = this.currentNewsletterId++;
    
    // Create subscription with proper typing
    const subscription: NewsletterSubscription = {
      id,
      email: insertSubscription.email,
      joinEmailChain: insertSubscription.joinEmailChain ?? false,
      subscriptionDate: new Date()
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }
  
  private initializeBoardMembers() {
    const defaultBoardMembers: InsertBoardMember[] = [
      {
        name: "Robert Johnson",
        position: "President",
        email: "rjohnson@riverwoodranch.org",
        phone: "(888) 555-1234"
      },
      {
        name: "Michael Chen",
        position: "Treasurer",
        email: "mchen@riverwoodranch.org",
        phone: "(888) 555-5678"
      },
      {
        name: "Emily Williams",
        position: "Secretary",
        email: "ewilliams@riverwoodranch.org",
        phone: "(888) 555-9012"
      }
    ];
    
    defaultBoardMembers.forEach(member => {
      this.createBoardMember(member);
    });
  }
  
  // Sync with Firebase Storage
  async syncWithFirebase(): Promise<void> {
    try {
      console.log("Syncing documents with Firebase Storage...");
      const [files] = await bucket.getFiles({ prefix: 'documents/' });
      
      if (files.length === 0) {
        console.log("No files found in Firebase Storage.");
        return;
      }
      
      console.log(`Found ${files.length} files in Firebase Storage.`);
      
      // Keep track of which document IDs we already have in local storage
      // to avoid duplicates
      const existingUrls = new Set(
        Array.from(this.documents.values()).map(doc => doc.fileContent)
      );
      
      for (const file of files) {
        try {
          // Skip files that aren't in the right format (like folders)
          if (!file.name.includes('-')) continue;
          
          // Get the public URL
          await file.makePublic();
          const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${file.name}`);
          
          // Skip if we already have this document
          if (existingUrls.has(publicUrl)) {
            console.log(`Document already exists: ${file.name}`);
            continue;
          }
          
          // Extract original filename
          const fileName = file.name.split('/').pop() || '';
          const originalName = fileName.substring(fileName.indexOf('-') + 1).replace(/_/g, ' ');
          
          // Try to determine document type from file extension
          const fileExtension = path.extname(originalName).toLowerCase();
          let docType = 'other';
          
          if (fileExtension === '.pdf') {
            if (originalName.toLowerCase().includes('financial')) {
              docType = 'financial';
            } else if (originalName.toLowerCase().includes('minutes')) {
              docType = 'minutes';
            } else if (originalName.toLowerCase().includes('map')) {
              docType = 'map';
            } else if (originalName.toLowerCase().includes('schedule')) {
              docType = 'schedule';
            } else if (originalName.toLowerCase().includes('agreement') || 
                     originalName.toLowerCase().includes('bylaw')) {
              docType = 'agreement';
            }
          }
          
          // Get file metadata
          const [metadata] = await file.getMetadata();
          // Use current time if metadata.timeCreated is not available
          const createTime = metadata.timeCreated 
            ? new Date(metadata.timeCreated as string) 
            : new Date();
          
          // Generate a document title from the filename
          const title = originalName.replace(fileExtension, '')
            .split('_').join(' ')
            .split('-').join(' ')
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
          
          // Create a new document record
          const id = this.currentDocumentId++;
          const document: Document = {
            id,
            title,
            type: docType,
            description: `Uploaded on ${createTime.toLocaleDateString()}`,
            fileName: originalName,
            fileContent: publicUrl,
            uploadDate: createTime,
            visibility: 'public', // Default to public visibility
            archived: false // Default to not archived
          };
          
          // Add to our document map
          this.documents.set(id, document);
          console.log(`Added document from Firebase: ${title}`);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
      
      // Save the updated documents to local storage
      this.saveDocuments();
      console.log("Firebase sync complete.");
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      throw error;
    }
  }
}

export const storage = new MemStorage();
