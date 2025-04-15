import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Record schema
export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  fileName: text("file_name").notNull(),
  fileContent: text("file_content").notNull(), 
  visibility: text("visibility").notNull().default("public"), // public, protected, admin
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  archived: boolean("archived").notNull().default(false) // set by admin //viewable by users // hidden from public
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  uploadDate: true,
});

export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;

// Board member schema
export const boardMembers = pgTable("board_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

export const insertBoardMemberSchema = createInsertSchema(boardMembers).omit({
  id: true,
});

export type InsertBoardMember = z.infer<typeof insertBoardMemberSchema>;
export type BoardMember = typeof boardMembers.$inferSelect;

// Contact form schema
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isPropertyOwner: boolean("is_property_owner").notNull().default(false),
  submissionDate: timestamp("submission_date").notNull().defaultNow(),
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  submissionDate: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

