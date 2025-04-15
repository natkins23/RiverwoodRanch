/**
 * Implements in-memory storage (`MemStorage`) with optional Firebase syncing and local file persistence.
 *
 * Key responsibilities:
 * - Stores and manages users, document records, board members, and contact form submissions in memory.
 * - Persists records to disk via `records.json` for data recovery across restarts.
 * - Syncs with Firebase Storage on startup, transforming files into `Record` objects.
 * - Falls back to generating sample records if no Firebase sync or local records exist.
 * - Provides consistent CRUD methods for all major data types, including board member updates and record archiving.
 * - Deletes files from Firebase Storage when associated records are removed.
 * - Implements `IStorage` interface for flexibility and potential replacement with a real database.
 */



import { 
  users, type User, type InsertUser,
  records, type Record, type InsertRecord,
  boardMembers, type BoardMember, type InsertBoardMember,
  contactSubmissions, type ContactSubmission, type InsertContact,
} from "@shared/schema";
import { bucket } from "./firebase";

import * as fs from 'fs';
import * as path from 'path';
import { format } from "util";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Record methods
  getAllRecords(): Promise<Record[]>;
  getRecordById(id: number): Promise<Record | undefined>;
  createRecord(record: InsertRecord): Promise<Record>;
  updateRecordArchiveStatus(id: number, archived: boolean): Promise<Record | undefined>;
  deleteRecord(id: number): Promise<boolean>;
  syncWithFirebase(): Promise<void>; // New method to sync with Firebase
  createSampleRecords(): Promise<void>; // Method to create sample records
  
  // Board member methods
  getAllBoardMembers(): Promise<BoardMember[]>;
  getBoardMemberById(id: number): Promise<BoardMember | undefined>;
  createBoardMember(boardMember: InsertBoardMember): Promise<BoardMember>;
  updateBoardMembers(boardMembers: BoardMember[]): Promise<void>;
  
  // Contact form methods
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  
  // Newsletter methods
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private records: Map<number, Record>;
  private boardMembers: Map<number, BoardMember>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private deletedFileUrls: Set<string>; // Track deleted file URLs to prevent re-sync
  
  currentId: number;
  currentRecordId: number;
  currentBoardMemberId: number;
  currentContactId: number;
  currentNewsletterId: number;
  
  private dataDir: string;
  private recordStoragePath: string;
  
  constructor() {
    this.users = new Map();
    this.records = new Map();
    this.boardMembers = new Map();
    this.contactSubmissions = new Map();
    this.deletedFileUrls = new Set<string>();
    
    this.currentId = 1;
    this.currentRecordId = 1;
    this.currentBoardMemberId = 1;
    this.currentContactId = 1;
    this.currentNewsletterId = 1;
    
    // Setup persistent storage directory and file path
    this.dataDir = path.join(process.cwd(), 'data');
    this.recordStoragePath = path.join(this.dataDir, 'records.json');
    
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Load records from file if available
    this.loadRecords();
    
    // Initialize with default board members
    this.initializeBoardMembers();
    
    // If no records exist, create sample records
    if (this.records.size === 0) {
      console.log("No records found. Creating example records...");
      this.createSampleRecords();
    }
    
    // Sync with Firebase Storage; if it fails, log the error
    this.syncWithFirebase().catch((err: Error) => {
      console.error("Error syncing with Firebase:", err);
    });
  }
  
  // Save records to a file
  private saveRecords() {
    const recordsArray = Array.from(this.records.values());
    fs.writeFileSync(this.recordStoragePath, JSON.stringify(recordsArray, null, 2));
  }
  
  // Load records from file
  private loadRecords() {
    try {
      if (fs.existsSync(this.recordStoragePath)) {
        const fileData = fs.readFileSync(this.recordStoragePath, 'utf8');
        const records: Record[] = JSON.parse(fileData);
        
        let maxId = 0;
        records.forEach(rec => {
          rec.uploadDate = new Date(rec.uploadDate);
          this.records.set(rec.id, rec);
          if (rec.id > maxId) {
            maxId = rec.id;
          }
        });
        this.currentRecordId = maxId + 1;
        console.log(`Loaded ${records.length} records from storage`);
      }
    } catch (error) {
      console.error('Error loading records from file:', error);
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Record methods
  async getAllRecords(): Promise<Record[]> {
    if (this.records.size === 0) {
      console.log("No records found during getAllRecords. Creating examples...");
      this.createSampleRecords();
    }
    return Array.from(this.records.values());
  }
  
  async getRecordById(id: number): Promise<Record | undefined> {
    return this.records.get(id);
  }
  
  async createRecord(insertRecord: InsertRecord): Promise<Record> {
    const id = this.currentRecordId++;
    const visibility = insertRecord.visibility || "public";
    
    const record: Record = {
      ...insertRecord,
      id,
      visibility,
      uploadDate: new Date(),
      archived: false
    };
    this.records.set(id, record);
    this.saveRecords();
    return record;
  }
  
  async updateRecordArchiveStatus(id: number, archived: boolean): Promise<Record | undefined> {
    const record = this.records.get(id);
    if (!record) return undefined;
    
    const updatedRecord: Record = { ...record, archived };
    this.records.set(id, updatedRecord);
    this.saveRecords();
    return updatedRecord;
  }
  
  async deleteRecord(id: number): Promise<boolean> {
    const record = this.records.get(id);
    if (!record) return false;
    
    const success = this.records.delete(id);
    if (success) {
      this.saveRecords();
      
      if (record.fileContent && record.fileContent.includes('storage.googleapis.com')) {
        try {
          this.deletedFileUrls.add(record.fileContent);
          const fileUrl = new URL(record.fileContent);
          const pathParts = fileUrl.pathname.split('/');
          const filePath = pathParts.slice(2).join('/');
          console.log(`Attempting to delete file: ${filePath}`);
          const file = bucket.file(filePath);
          await file.delete().then(() => {
            console.log(`Successfully deleted file ${filePath} from Firebase Storage`);
          }).catch((err) => {
            console.error(`Failed to delete file ${filePath} from Firebase:`, err);
            this.deletedFileUrls.add(record.fileContent);
          });
        } catch (error) {
          console.error("Error deleting file from Firebase:", error);
          this.deletedFileUrls.add(record.fileContent);
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
  
  async updateBoardMembers(boardMembers: BoardMember[]): Promise<void> {
    this.boardMembers.clear();
    boardMembers.forEach(member => {
      this.boardMembers.set(member.id, member);
    });
  }
  
  // Contact form methods
  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const id = this.currentContactId++;
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
    const hasExistingRecords = this.records.size > 0;
    
    try {
      console.log("Syncing records with Firebase Storage...");
      
      const [files] = await bucket.getFiles({ prefix: 'records/' });
      
      if (files.length === 0) {
        console.log("No files found in Firebase Storage.");
        return;
      }
      
      console.log(`Found ${files.length} files in Firebase Storage.`);
      
      const existingUrls = new Set(
        Array.from(this.records.values()).map(rec => rec.fileContent)
      );
      
      for (const file of files) {
        try {
          if (!file.name.includes('-')) continue;
          
          await file.makePublic();
          const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${file.name}`);
          
          if (this.deletedFileUrls.has(publicUrl)) {
            console.log(`Skipping deleted record: ${file.name}`);
            continue;
          }
          
          if (existingUrls.has(publicUrl)) {
            console.log(`Record already exists: ${file.name}`);
            continue;
          }
          
          const fileName = file.name.split('/').pop() || '';
          const originalName = fileName.substring(fileName.indexOf('-') + 1).replace(/_/g, ' ');
          const fileExtension = path.extname(originalName).toLowerCase();
          let recType = 'other';
          
          if (fileExtension === '.pdf') {
            if (originalName.toLowerCase().includes('financial')) {
              recType = 'financial';
            } else if (originalName.toLowerCase().includes('minutes')) {
              recType = 'minutes';
            } else if (originalName.toLowerCase().includes('map')) {
              recType = 'map';
            } else if (originalName.toLowerCase().includes('schedule')) {
              recType = 'schedule';
            } else if (originalName.toLowerCase().includes('agreement') || 
                       originalName.toLowerCase().includes('bylaw')) {
              recType = 'agreement';
            }
          } else if (fileExtension === '.docx' || fileExtension === '.doc') {
            if (originalName.toLowerCase().includes('bylaw')) {
              recType = 'bylaw';
            } else if (originalName.toLowerCase().includes('minutes')) {
              recType = 'minutes';
            } else {
              recType = 'agreement';
            }
          }
          
          const [metadata] = await file.getMetadata();
          const createTime = metadata.timeCreated 
            ? new Date(metadata.timeCreated as string) 
            : new Date();
          
          const title = originalName.replace(fileExtension, '')
            .split('_').join(' ')
            .split('-').join(' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          const id = this.currentRecordId++;
          const record: Record = {
            id,
            title,
            type: recType,
            description: `Uploaded on ${createTime.toLocaleDateString()}`,
            fileName: originalName,
            fileContent: publicUrl,
            uploadDate: createTime,
            visibility: 'public',
            archived: false
          };
          
          this.records.set(id, record);
          console.log(`Added record from Firebase: ${title}`);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
      
      this.saveRecords();
      console.log("Firebase sync complete.");
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      if (!hasExistingRecords && this.records.size === 0) {
        this.createSampleRecords();
      }
    }
  }
  
  // Create sample records if Firebase fails and there are no records available
  async createSampleRecords(): Promise<void> {
    console.log("Creating example records since Firebase is unavailable");
    
    const exampleRecs = [
      {
        title: "Annual HOA Meeting Minutes",
        type: "minutes",
        description: "Minutes from the annual homeowners association meeting",
        fileName: "annual_meeting_minutes.pdf",
        visibility: "public"
      },
      {
        title: "Ranch Bylaws Record",
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
    
    exampleRecs.forEach(rec => {
      const id = this.currentRecordId++;
      const record: Record = {
        id,
        title: rec.title,
        type: rec.type,
        description: rec.description,
        fileName: rec.fileName,
        fileContent: `https://placeholder-recs.example/${rec.fileName}`,
        uploadDate: new Date(),
        visibility: rec.visibility as 'public' | 'protected' | 'admin',
        archived: false
      };
      this.records.set(id, record);
    });
    
    this.saveRecords();
  }
}

export const storage = new MemStorage();
