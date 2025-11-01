import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  addTrigger,
  getTriggers,
  triggerWorkflow,
  addAction,
  getActions,
  previewAction,
  updateWorkflowEnabled,
  deleteWorkflow,
} from "../controllers/workflow.controller.js";

const router = Router();

router.get("/", authenticateToken, getWorkflows);
router.get("/:id", authenticateToken, getWorkflowById);
router.post("/", authenticateToken, createWorkflow);
router.post("/triggers", authenticateToken, addTrigger);
router.get("/triggers/:workflowId", authenticateToken, getTriggers);
router.post("/actions", authenticateToken, addAction);
router.get("/actions/:workflowId", authenticateToken, getActions);
router.post("/actions/preview", authenticateToken, previewAction);
router.post("/trigger", authenticateToken, triggerWorkflow);
router.put("/:id", authenticateToken, updateWorkflowEnabled);
router.delete("/:id", authenticateToken, deleteWorkflow);

export default router;
