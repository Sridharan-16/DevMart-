import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("buyer"), // buyer, seller, both
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  technologies: jsonb("technologies").$type<string[]>().notNull().default([]),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  previewImageUrl: text("preview_image_url"),
  codeFileUrl: text("code_file_url").notNull(),
  verified: boolean("verified").default(false).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, resolved, dismissed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  purchases: many(purchases),
  reviews: many(reviews),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  reports: many(reports),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  seller: one(users, {
    fields: [projects.sellerId],
    references: [users.id],
  }),
  purchases: many(purchases),
  reviews: many(reviews),
  messages: many(messages),
  reports: many(reports),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  buyer: one(users, {
    fields: [purchases.buyerId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [purchases.projectId],
    references: [projects.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  project: one(projects, {
    fields: [reviews.projectId],
    references: [projects.id],
  }),
  buyer: one(users, {
    fields: [reviews.buyerId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  project: one(projects, {
    fields: [reports.projectId],
    references: [projects.id],
  }),
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [reports.sellerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  fullName: z.string(),
  role: z.enum(["buyer", "seller", "both"]),
  stripeCustomerId: z.string().nullable().optional(),
});

export const insertProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  category: z.string(),
  technologies: z.array(z.string()),
  sellerId: z.number().optional(),
  previewImageUrl: z.string().nullable().optional(),
  codeFileUrl: z.string().optional(),
});

export const insertPurchaseSchema = z.object({
  buyerId: z.number(),
  projectId: z.number(),
  amount: z.string(),
  stripePaymentIntentId: z.string().nullable().optional(),
});

export const insertReviewSchema = z.object({
  projectId: z.number(),
  buyerId: z.number(),
  rating: z.number(),
  comment: z.string().nullable().optional(),
});

export const insertMessageSchema = z.object({
  projectId: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
});

export const insertReportSchema = z.object({
  projectId: z.number(),
  reporterId: z.number(),
  sellerId: z.number(),
  reason: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "resolved", "dismissed"]),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
