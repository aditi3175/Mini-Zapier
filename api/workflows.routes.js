import { Router } from "express";
import prisma from "../DB/db.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { workflowQueue } from "../DB/queue.js";

const router = Router();


// GET /api/workflows 
router.get("/", authenticateToken, async (req, res) => {
  try {
    const workflows = await prisma.Workflow.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        enabled: true,
        createdAt: true,
      },
    });
    res.status(200).json({ workflows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/workflows 
router.post("/", authenticateToken, async (req, res) => {
  const { name, enabled } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Workflow name is required" });
  }

  try {
    const workflow = await prisma.Workflow.create({
      data: {
        name,
        enabled: enabled ?? true,
        userId: req.user.id,
      },
      select: {
        id: true,
        name: true,
        enabled: true,
        createdAt: true,
      },
    });

    res.status(201).json({ workflow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// POST /api/workflows/triggers 
router.post("/triggers", authenticateToken, async (req, res) => {
  const { workflowId, type, config } = req.body;

  if (!workflowId || !type) {
    return res.status(400).json({ message: "workflowId and type are required" });
  }

  try {
    const workflow = await prisma.Workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed for this workflow" });
    }

    const trigger = await prisma.Trigger.create({
      data: {
        workflowId,
        type,
        config,
      },
    });

    res.status(201).json({ trigger });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// POST /api/workflows/actions 
router.post("/actions", authenticateToken, async (req, res) => {
  const { workflowId, type, config, orderIndex } = req.body;

  if (!workflowId || !type) {
    return res.status(400).json({ message: "workflowId and type are required" });
  }

  try {
    const workflow = await prisma.Workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed for this workflow" });
    }

    const action = await prisma.Action.create({
      data: {
        workflowId,
        type,
        config,
        orderIndex: orderIndex ?? 0,
      },
    });

    res.status(201).json({ action });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// POST /api/workflows/trigger 
// router.post("/trigger", async (req, res) => {
//   const { workflowId, actionType, data } = req.body;

//   await workflowQueue.add(actionType, data);

//   res.json({ message: "Action added to queue successfully!" });
// });


router.post("/trigger", async (req, res) => {
  const { workflowId, actions } = req.body;

  await workflowQueue.add("runWorkflow", { workflowId, actions });

  res.json({ message: "Workflow queued!" });
});


export default router;
