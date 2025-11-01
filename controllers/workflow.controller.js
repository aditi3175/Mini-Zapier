import { createTrigger, getWorkflowTriggers } from "../services/trigger.services.js";
import { addWorkflowAction, getWorkflowActions } from "../services/workflow.services.js";
import { enqueueWorkflow } from "../services/job.services.js";
import prisma from "../DB/db.js";
import crypto from "crypto";

// GET all workflows for a user
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await prisma.Workflow.findMany({
      where: { userId: req.user.id },
      select: { id: true, name: true, enabled: true, createdAt: true },
    });
    res.status(200).json({ workflows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET a single workflow by id
export const getWorkflowById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const wf = await prisma.Workflow.findUnique({
      where: { id },
      select: { id: true, name: true, enabled: true, secret: true, createdAt: true, userId: true },
    });
    if (!wf || wf.userId !== req.user.id) return res.status(404).json({ message: "Workflow not found" });
    return res.status(200).json({ workflow: { id: wf.id, name: wf.name, enabled: wf.enabled, secret: wf.secret, createdAt: wf.createdAt } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE a new workflow
export const createWorkflow = async (req, res) => {
  const { name, enabled } = req.body;
  if (!name) return res.status(400).json({ message: "Workflow name is required" });

  try {
    // Generate unique secret for webhook authentication
    const secret = crypto.randomBytes(32).toString('hex');
    
    const workflow = await prisma.Workflow.create({
      data: { name, enabled: enabled ?? true, userId: req.user.id, secret },
      select: { id: true, name: true, enabled: true, secret: true, createdAt: true },
    });
    res.status(201).json({ workflow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE a trigger for a workflow
export const addTrigger = async (req, res) => {
  try {
    const trigger = await createTrigger(req.user.id, req.body);
    res.status(201).json({ trigger });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });
  }
};

// GET all triggers for a workflow
export const getTriggers = async (req, res) => {
  try {
    const triggers = await getWorkflowTriggers(req.params.workflowId, req.user.id);
    res.status(200).json({ triggers });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });
  }
};

// CREATE an action for a workflow
export const addAction = async (req, res) => {
  try {
    const action = await addWorkflowAction(req.user.id, req.body);
    res.status(201).json({ action });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });
  }
};

// GET all actions for a workflow
export const getActions = async (req,res) => {
  try {
    const actions = await getWorkflowActions(req.params.workflowId, req.user.id);
    res.status(200).json({ actions })
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: error.message });
  }
};

// PREVIEW action config with payload (resolve placeholders without sending)
export const previewAction = async (req, res) => {
  try {
    const { actionId, config, payload } = req.body;

    let baseConfig = config;
    if (!baseConfig && actionId) {
      const action = await prisma.Action.findUnique({ where: { id: Number(actionId) } });
      if (!action) return res.status(404).json({ message: "Action not found" });
      // Optional ownership check: ensure current user owns workflow
      const wf = await prisma.Workflow.findUnique({ where: { id: action.workflowId } });
      if (!wf || wf.userId !== req.user.id) return res.status(403).json({ message: "Not allowed" });
      baseConfig = action.config;
    }

    if (!baseConfig) return res.status(400).json({ message: "Provide config or actionId" });

    const resolve = (value) => {
      if (typeof value !== "string") return value;
      return value.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
        const keys = rawPath.trim().split(".");
        if (keys[0] === "payload") keys.shift();
        let v = payload;
        for (const k of keys) {
          if (v == null || typeof v !== "object" || !(k in v)) return "";
          v = v[k];
        }
        return v == null ? "" : String(v);
      });
    };

    const resolved = Object.fromEntries(
      Object.entries(baseConfig).map(([k, v]) => [k, resolve(v)])
    );

    return res.status(200).json({ resolved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to preview action" });
  }
};

// ENQUEUE a workflow to run actions
export const triggerWorkflow = async (req, res) => {
  const { workflowId, actions, payload } = req.body;

  try {
    // Get the first trigger for this workflow to associate with the job
    const trigger = await prisma.Trigger.findFirst({
      where: { workflowId: Number(workflowId) },
    });

    await enqueueWorkflow(workflowId, actions, trigger?.id, payload);
    res.json({ message: "Workflow queued successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to queue workflow" });
  }
};

// UPDATE workflow enabled flag
export const updateWorkflowEnabled = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { enabled } = req.body;
    const wf = await prisma.Workflow.findUnique({ where: { id } });
    if (!wf || wf.userId !== req.user.id) return res.status(404).json({ message: "Workflow not found" });
    const updated = await prisma.Workflow.update({ where: { id }, data: { enabled: Boolean(enabled) }, select: { id: true, name: true, enabled: true } });
    return res.status(200).json({ workflow: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update workflow" });
  }
};

// DELETE a workflow the user owns
export const deleteWorkflow = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const wf = await prisma.Workflow.findUnique({ where: { id } });
    if (!wf || wf.userId !== req.user.id) return res.status(404).json({ message: "Workflow not found" });
    // Delete children first due to FKs
    await prisma.Action.deleteMany({ where: { workflowId: id } });
    await prisma.Trigger.deleteMany({ where: { workflowId: id } });
    await prisma.Job.deleteMany({ where: { workflowId: id } });
    await prisma.Workflow.delete({ where: { id } });
    return res.status(200).json({ message: "Workflow deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete workflow" });
  }
};
