import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  boardMembers, type BoardMember, type InsertBoardMember,
  contactSubmissions, type ContactSubmission, type InsertContact,
  newsletterSubscriptions, type NewsletterSubscription, type InsertNewsletter
} from "@shared/schema";

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
  
  // Board member methods
  getAllBoardMembers(): Promise<BoardMember[]>;
  getBoardMemberById(id: number): Promise<BoardMember | undefined>;
  createBoardMember(boardMember: InsertBoardMember): Promise<BoardMember>;
  
  // Contact form methods
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletter): Promise<NewsletterSubscription>;
}

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
    
    // Initialize with default board members
    this.initializeBoardMembers();
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
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadDate: new Date() 
    };
    this.documents.set(id, document);
    return document;
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
    const contact: ContactSubmission = { 
      ...insertContact, 
      id, 
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
    const subscription: NewsletterSubscription = { 
      ...insertSubscription, 
      id, 
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
}

export const storage = new MemStorage();
