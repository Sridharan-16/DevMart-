import { 
  users, projects, purchases, reviews, messages, reports,
  type User, type InsertUser, type Project, type InsertProject,
  type Purchase, type InsertPurchase, type Review, type InsertReview,
  type Message, type InsertMessage, type Report, type InsertReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithSeller(id: number): Promise<any>;
  getProjects(filters?: { category?: string; sellerId?: number }): Promise<any[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  verifyProject(id: number): Promise<Project>;

  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(buyerId: number, projectId: number): Promise<Purchase | undefined>;
  getUserPurchases(userId: number): Promise<any[]>;

  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getProjectReviews(projectId: number): Promise<any[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getProjectMessages(projectId: number): Promise<any[]>;

  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<any[]>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectWithSeller(id: number): Promise<any> {
    const [result] = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        price: projects.price,
        category: projects.category,
        technologies: projects.technologies,
        previewImageUrl: projects.previewImageUrl,
        verified: projects.verified,
        downloads: projects.downloads,
        rating: projects.rating,
        reviewCount: projects.reviewCount,
        createdAt: projects.createdAt,
        seller: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(projects)
      .leftJoin(users, eq(projects.sellerId, users.id))
      .where(eq(projects.id, id));
    return result || undefined;
  }

  async getProjects(filters?: { category?: string; sellerId?: number }): Promise<any[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(projects.category, filters.category));
    }
    if (filters?.sellerId) {
      conditions.push(eq(projects.sellerId, filters.sellerId));
    }

    const baseQuery = db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        price: projects.price,
        category: projects.category,
        technologies: projects.technologies,
        previewImageUrl: projects.previewImageUrl,
        verified: projects.verified,
        downloads: projects.downloads,
        rating: projects.rating,
        reviewCount: projects.reviewCount,
        createdAt: projects.createdAt,
        seller: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(projects)
      .leftJoin(users, eq(projects.sellerId, users.id));

    if (conditions.length > 0) {
      return await baseQuery
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(projects.createdAt));
    } else {
      return await baseQuery.orderBy(desc(projects.createdAt));
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Only include valid fields for the DB insert
    const dbProject = {
      title: project.title,
      description: project.description,
      price: project.price,
      category: project.category,
      technologies: project.technologies,
      sellerId: project.sellerId,
      previewImageUrl: project.previewImageUrl,
      codeFileUrl: project.codeFileUrl,
      codeFileData: project.codeFileData,
    };
    const [newProject] = await db.insert(projects).values(dbProject).returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async verifyProject(id: number): Promise<Project> {
    const [verifiedProject] = await db
      .update(projects)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return verifiedProject;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    
    // Increment download count
    await db
      .update(projects)
      .set({ downloads: sql`${projects.downloads} + 1` })
      .where(eq(projects.id, purchase.projectId));
    
    return newPurchase;
  }

  async getPurchase(buyerId: number, projectId: number): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.buyerId, buyerId), eq(purchases.projectId, projectId)));
    return purchase || undefined;
  }

  async getUserPurchases(userId: number): Promise<any[]> {
    return await db
      .select({
        id: purchases.id,
        amount: purchases.amount,
        createdAt: purchases.createdAt,
        project: {
          id: projects.id,
          title: projects.title,
          description: projects.description,
          previewImageUrl: projects.previewImageUrl,
          codeFileUrl: projects.codeFileUrl,
        },
      })
      .from(purchases)
      .leftJoin(projects, eq(purchases.projectId, projects.id))
      .where(eq(purchases.buyerId, userId))
      .orderBy(desc(purchases.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update project rating
    const projectReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.projectId, review.projectId));
    
    const avgRating = projectReviews.reduce((sum, r) => sum + r.rating, 0) / projectReviews.length;
    
    await db
      .update(projects)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: projectReviews.length 
      })
      .where(eq(projects.id, review.projectId));
    
    return newReview;
  }

  async getProjectReviews(projectId: number): Promise<any[]> {
    return await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        buyer: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.buyerId, users.id))
      .where(eq(reviews.projectId, projectId))
      .orderBy(desc(reviews.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getProjectMessages(projectId: number): Promise<any[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.projectId, projectId))
      .orderBy(messages.createdAt);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(): Promise<any[]> {
    return await db
      .select({
        id: reports.id,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        createdAt: reports.createdAt,
        project: {
          id: projects.id,
          title: projects.title,
        },
        reporter: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(reports)
      .leftJoin(projects, eq(reports.projectId, projects.id))
      .leftJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt));
  }
}

export const storage = new DatabaseStorage();
