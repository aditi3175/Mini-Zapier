import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./DB/db.js";

dotenv.config();

console.log("🚀 Starting Mini Zapier Backend...");
console.log("PORT:", process.env.PORT || 3000);
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

// Test database connection (non-blocking in development)
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    if (process.env.NODE_ENV === "production") {
      console.error("🚨 Production mode: Exiting due to database connection failure");
      process.exit(1);
    } else {
      console.warn("⚠️  Development mode: Continuing without database (some features may not work)");
      return false;
    }
  }
}

// Connect database (non-blocking)
const dbConnected = await connectDatabase();

const app = express();

// CORS configuration - MUST be before routes
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

console.log("🌐 CORS origins:", corsOrigins);

// CORS middleware - handle '*' for allow all origins
const corsOptions = {
  origin: corsOrigins.includes('*') ? true : corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Import routes
import authRoutes from "./api/auth.routes.js";
import workflowRoutes from "./api/workflows.routes.js";
import webhookRoutes from "./api/webhooks.routes.js";
import profileRoutes from "./api/profile.routes.js";
import jobsRoutes from "./api/jobs.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.middleware.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobsRoutes);

// Test webhook endpoint (for testing outgoing webhooks from Mini Zapier)
// Also works as Slack webhook test endpoint (returns "ok" for Slack compatibility)
app.post("/api/test-webhook", (req, res) => {
  console.log("Received webhook (POST):", JSON.stringify(req.body, null, 2));
  console.log("Headers:", req.headers);
  
  // If it looks like a Slack webhook (has 'text' field), return "ok" for compatibility
  if (req.body.text !== undefined) {
    console.log("Slack-compatible webhook received:", req.body.text);
    return res.send("ok");
  }
  
  // Otherwise return detailed JSON response
  res.json({ 
    success: true, 
    message: "Webhook received successfully",
    receivedAt: new Date().toISOString(),
    data: req.body 
  });
});

// GET handler for browser testing
app.get("/api/test-webhook", (req, res) => {
  res.json({ 
    success: true, 
    message: "Test webhook endpoint is working!",
    note: "Use POST method to send actual webhook data",
    endpoint: "/api/test-webhook",
    method: "POST"
  });
});

// serve uploads directory
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => res.send("Mini Zapier Backend Running...."));
app.get("/health", (req, res) => res.send("OK"));

// 404 and Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    console.log(`📡 Health check: http://0.0.0.0:${PORT}/health`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

