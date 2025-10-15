import { Router } from "express";
import { workflowQueue } from "../DB/queue.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import prisma from "../DB/db.js";

const router = Router();
const prisma = new PrismaClient();

// POST /api/webhooks/:workflowId
router.post("/:workflowId", authenticateToken, async (req, res) => {
  const { workflowId } = req.params;
  const payload = req.body; 

  try {
    // Fetch workflow & its actions from DB
    const workflow = await prisma.Workflow.findUnique({
      where: { id: Number(workflowId) },
      include: { actions: true },
    });

    if (!workflow || !workflow.enabled) {
      return res.status(404).json({ message: "Workflow not found or disabled" });
    }

    // Add job to queue
    await workflowQueue.add("runWorkflow", {
      workflowId: workflow.id,
      actions: workflow.actions,
      payload, // optional: webhook data
    });

    // Respond immediately (don’t wait for job execution)
    res.status(200).json({ message: "Workflow triggered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
