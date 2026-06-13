import { z } from "zod";

// ============================================================
// Zod validation schemas — used by both forms (client) AND the API (server)
// ============================================================

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email format"),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{6,20}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  date: z.string().min(1, "Date & time is required"),
  endDate: z.string().optional().or(z.literal("")),
  location: z.string().min(2, "Location is required").max(200),
  locationUrl: z
    .string()
    .url("Invalid location URL")
    .optional()
    .or(z.literal("")),
  // String from the form or number from the API JSON — normalized on the server.
  capacity: z.union([z.string(), z.number()]).optional(),
  tags: z.string().optional().or(z.literal("")), // comma-separated in the form
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "ENDED"]).default("PUBLISHED"),
  requiresApproval: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "ORGANIZER", "STUDENT"]),
});

export const registerForEventSchema = z.object({
  notes: z.string().max(500).optional(),
});
