import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Import routes
import authRoutes from "./api/auth.routes.js";
import workflowRoutes from "./api/workflows.routes.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);

// Health check
app.get("/", (req, res) => res.send("Mini Zapier Backend Running...."));
app.get("/health", (req, res) => res.send("OK"));

app.listen(3000, () => console.log("Server is running on port 3000"));

