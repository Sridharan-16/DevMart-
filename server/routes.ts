import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import { insertProjectSchema, insertPurchaseSchema, insertReviewSchema, insertMessageSchema, insertReportSchema } from "@shared/schema";

// Dummy Stripe setup for development
const stripe = {
  paymentIntents: {
    create: async (data: any) => ({
      client_secret: "pi_dummy_client_secret",
      id: "pi_dummy_" + Date.now(),
      status: "requires_payment_method"
    }),
    retrieve: async (id: string) => ({
      id,
      status: "succeeded"
    })
  }
};

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { category, sellerId } = req.query;
      const projects = await storage.getProjects({
        category: category as string,
        sellerId: sellerId ? parseInt(sellerId as string) : undefined,
      });
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectWithSeller(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", requireAuth, upload.any(), async (req, res) => {
    try {
      console.log("🔥 Project upload hit");
      const files = req.files as Express.Multer.File[];
      console.log("📁 Files received:", files);
      console.log("📄 Body received:", req.body);

      // If fieldnames are 'files', use first as codeFile, second as previewImage
      let codeFile: Express.Multer.File | undefined;
      let previewImage: Express.Multer.File | undefined;
      if (files.length > 0 && files[0].fieldname === 'files') {
        codeFile = files[0];
        previewImage = files[1];
      } else {
        codeFile = files.find(f => f.fieldname === 'codeFile');
        previewImage = files.find(f => f.fieldname === 'previewImage');
      }

      if (!codeFile) {
        return res.status(400).json({ message: "Code file is required" });
      }

      const projectData = insertProjectSchema.parse({
        ...req.body,
        sellerId: req.user!.id,
        technologies: req.body.technologies ? req.body.technologies.split(',').map((t: string) => t.trim()) : [],
        codeFileUrl: `/uploads/${codeFile.filename}`,
        previewImageUrl: previewImage ? `/uploads/${previewImage.filename}` : null,
      });

      console.log("Creating project with data:", projectData);
      const project = await storage.createProject(projectData);
      
      // Mock verification process - in real app, this would run code verification
      setTimeout(async () => {
        await storage.verifyProject(project.id);
      }, 5000);

      console.log("Project created successfully:", project.id);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Purchase routes
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.body;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if already purchased
      const existingPurchase = await storage.getPurchase(req.user!.id, projectId);
      if (existingPurchase) {
        return res.status(400).json({ message: "Project already purchased" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(project.price) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          projectId: project.id.toString(),
          buyerId: req.user!.id.toString(),
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-purchase", requireAuth, async (req, res) => {
    try {
      const { paymentIntentId, projectId } = req.body;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create purchase record
      const purchase = await storage.createPurchase({
        buyerId: req.user!.id,
        projectId: projectId,
        amount: project.price,
        stripePaymentIntentId: paymentIntentId,
      });

      res.json({ purchase, downloadUrl: project.codeFileUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/purchases", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getUserPurchases(req.user!.id);
      res.json(purchases);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Check if project is purchased
  app.get("/api/purchases/:projectId", requireAuth, async (req, res) => {
    try {
      const purchase = await storage.getPurchase(req.user!.id, parseInt(req.params.projectId));
      res.json({ purchased: !!purchase, purchase });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        buyerId: req.user!.id,
      });

      // Check if user purchased the project
      const purchase = await storage.getPurchase(req.user!.id, reviewData.projectId);
      if (!purchase) {
        return res.status(403).json({ message: "You must purchase the project to review it" });
      }

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/:projectId", async (req, res) => {
    try {
      const reviews = await storage.getProjectReviews(parseInt(req.params.projectId));
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Message routes
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id,
      });

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/messages/:projectId", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getProjectMessages(parseInt(req.params.projectId));
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Report routes
  app.post("/api/reports", requireAuth, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        reporterId: req.user!.id,
      });

      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User dashboard routes
  app.get("/api/dashboard/seller", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjects({ sellerId: req.user!.id });
      res.json({ projects });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/buyer", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getUserPurchases(req.user!.id);
      res.json({ purchases });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
