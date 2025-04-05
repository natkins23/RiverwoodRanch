import { z } from "zod";

export const documentUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Please select a document type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  file: z.instanceof(File).refine(file => file.size > 0, "Please select a file")
});

export const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  isPropertyOwner: z.boolean().default(false),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
