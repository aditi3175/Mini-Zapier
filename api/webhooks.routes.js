import { Router } from "express";
import prisma from "../DB/db.js";
import { workflowQueue } from "../DB/queue.js";

const router = Router();

// POST /api/webhooks/:workflowId
router.post("/:workflowId", async (req, res) => {
  const { workflowId } = req.params;
  const payload = req.body;
  const authHeader = req.headers.authorization;

  try {
    // Fetch workflow & actions
    const workflow = await prisma.Workflow.findUnique({
      where: { id: Number(workflowId) },
      include: { actions: true },
    });

    if (!workflow || !workflow.enabled) {
      return res.status(404).json({ message: "Workflow not found or disabled" });
    }

    const trigger = await prisma.Trigger.findFirst({
      where: { workflowId: Number(workflowId) },
    });
    

    // ---------- AUTH CHECK ----------
    // If Authorization header exists, verify JWT
    let user = null;
    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await authenticateTokenFromToken(token);
        if (!decoded) throw new Error("Invalid token");
        user = await prisma.User.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true },
        });
      } catch (err) {
        return res.status(401).json({ message: "Invalid auth token" });
      }
    }

    // If no JWT, verify workflow secret from body
    if (!user) {
      if (!workflow.secret) {
        return res.status(401).json({ message: "Workflow secret not configured. Please set a secret for this workflow." });
      }
      if (!payload.workflowSecret || payload.workflowSecret !== workflow.secret) {
        return res.status(401).json({ message: "Invalid or missing workflow secret" });
      }
    }

    // ---------- ENQUEUE WORKFLOW ----------
    await workflowQueue.add("runWorkflow", {
      workflowId: workflow.id,
      actions: workflow.actions,
      triggerId: trigger?.id,  
      payload,
      triggeredBy: user ? { id: user.id, email: user.email } : null,
    });
    

    return res.status(200).json({ message: "Workflow triggered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Helper: decode token without middleware
import { verifyToken } from "../services/auth.services.js";
async function authenticateTokenFromToken(token) {
  return verifyToken(token); // returns payload { id, role }
}

export default router;
