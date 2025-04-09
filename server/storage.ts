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
  createSampleDocuments(): Promise<void>; // Method to create sample documents
  
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
  private deletedFileUrls: Set<string>; // Track deleted file URLs to prevent re-sync
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
    this.deletedFileUrls = new Set<string>(); // Initialize the set for deleted URLs
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
    
    // Check if we need to create sample documents (if none exist)
    if (this.documents.size === 0) {
      console.log("No documents found. Creating example documents...");
      this.createSampleDocuments();
    }
    
    // Try to sync with Firebase, but don't worry if it fails
    // since we already have sample documents
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
    // If we have no documents, create sample ones
    if (this.documents.size === 0) {
      console.log("No documents found during getAllDocuments. Creating examples...");
      this.createSampleDocuments();
    }
    
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
      
      // Attempt to delete from Firebase Storage if this is a real document
      if (document.fileContent && document.fileContent.includes('storage.googleapis.com')) {
        try {
          // Add to deleted URLs set to prevent re-creation during sync
          this.deletedFileUrls.add(document.fileContent);
          
          // Parse the file path from the storage URL
          // Format: https://storage.googleapis.com/BUCKET_NAME/documents/FILENAME
          const fileUrl = new URL(document.fileContent);
          const pathParts = fileUrl.pathname.split('/');
          
          // Get the actual file path after the bucket name
          // The pathname will be like /BUCKET_NAME/documents/filename.pdf
          // We want to extract "documents/filename.pdf"
          const filePath = pathParts.slice(2).join('/');
          
          console.log(`Attempting to delete file: ${filePath}`);
          
          // Get reference to the file and delete it
          const file = bucket.file(filePath);
          
          // Use a promise to properly await deletion
          await file.delete()
            .then(() => {
              console.log(`Successfully deleted file ${filePath} from Firebase Storage`);
            })
            .catch((err) => {
              console.error(`Failed to delete file ${filePath} from Firebase:`, err);
              // Still mark this URL as deleted to prevent recreation
              this.deletedFileUrls.add(document.fileContent);
            });
          
        } catch (error) {
          console.error("Error deleting file from Firebase:", error);
          // Still mark this URL as deleted to prevent recreation during sync
          this.deletedFileUrls.add(document.fileContent);
        }
      }
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
    // First check if we have any documents already
    const hasExistingDocuments = this.documents.size > 0;
    
    try {
      console.log("Syncing documents with Firebase Storage...");
      
      // If Firebase isn't properly configured, this will throw an error
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
          
          // Skip if this URL is in our deleted URLs list or we already have it
          if (this.deletedFileUrls.has(publicUrl)) {
            console.log(`Skipping deleted document: ${file.name}`);
            continue;
          }
          
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
          } else if (fileExtension === '.docx' || fileExtension === '.doc') {
            if (originalName.toLowerCase().includes('bylaw')) {
              docType = 'bylaw';
            } else if (originalName.toLowerCase().includes('minutes')) {
              docType = 'minutes';
            } else {
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
          // Continue processing other files even if one fails
        }
      }
      
      // Save the updated documents to local storage
      this.saveDocuments();
      console.log("Firebase sync complete.");
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      
      // If no documents exist yet, add some placeholder documents
      if (!hasExistingDocuments && this.documents.size === 0) {
        this.createSampleDocuments();
      }
    }
  }
  
  // Create sample documents if Firebase fails and we have no documents
  async createSampleDocuments(): Promise<void> {
    console.log("Creating example documents since Firebase is unavailable");
    
    // Add some example documents with different types
    const exampleDocs = [
      {
        title: "Annual HOA Meeting Minutes",
        type: "minutes",
        description: "Minutes from the annual homeowners association meeting",
        fileName: "annual_meeting_minutes.pdf",
        visibility: "public"
      },
      {
        title: "Ranch Bylaws Document",
        type: "bylaw",
        description: "Official bylaws for Riverwood Ranch",
        fileName: "ranch_bylaws.pdf",
        visibility: "protected"
      },
      {
        title: "Property Map",
        type: "map",
        description: "Map of all properties in the Riverwood Ranch community",
        fileName: "property_map.pdf",
        visibility: "public"
      },
      {
        title: "Financial Statement 2023",
        type: "financial",
        description: "Annual financial statement for the year 2023",
        fileName: "financial_2023.pdf",
        visibility: "admin"
      },
      {
        title: "Community Event Schedule",
        type: "schedule",
        description: "Schedule of upcoming community events",
        fileName: "event_schedule.pdf",
        visibility: "public"
      }
    ];
    
    exampleDocs.forEach(doc => {
      const id = this.currentDocumentId++;
      
      const document: Document = {
        id,
        title: doc.title,
        type: doc.type,
        description: doc.description,
        fileName: doc.fileName,
        // Use a placeholder URL that won't actually work but indicates it's a placeholder
        fileContent: `https://placeholder-docs.example/${doc.fileName}`,
        uploadDate: new Date(),
        visibility: doc.visibility as 'public' | 'protected' | 'admin',
        archived: false
      };
      
      this.documents.set(id, document);
    });
    
    // Save these document examples
    this.saveDocuments();
  }
}

export const storage = new MemStorage();
