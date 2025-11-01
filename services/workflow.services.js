import prisma from "../DB/db.js";

// Get all workflows for a user
export const getUserWorkflows = async (userId) => {
  return prisma.Workflow.findMany({
    where: { userId },
    select: { id: true, name: true, enabled: true, createdAt: true },
  });
};

// Create a workflow
export const createNewWorkflow = async (userId, { name, enabled }) => {
  return prisma.Workflow.create({
    data: { name, enabled: enabled ?? true, userId },
    select: { id: true, name: true, enabled: true, createdAt: true },
  });
};

// Add trigger
export const addWorkflowTrigger = async (userId, { workflowId, type, config }) => {
  const workflow = await prisma.Workflow.findUnique({ where: { id: Number(workflowId) } });
  if (!workflow || workflow.userId !== userId) throw new Error("Not allowed");

  return prisma.Trigger.create({ data: { workflowId: Number(workflowId), type, config } });
};

// Add action
export const addWorkflowAction = async (userId, { workflowId, type, config, orderIndex }) => {
  const workflow = await prisma.Workflow.findUnique({ where: { id: Number(workflowId) } });
  if (!workflow || workflow.userId !== userId) throw new Error("Not allowed");

  return prisma.Action.create({
    data: { workflowId: Number(workflowId), type, config, order: orderIndex ?? 0 },
  });
};

// Get actions for a workflow (ordered)
export const getWorkflowActions = async (workflowId, userId) => {
  const workflow = await prisma.Workflow.findUnique({ where: { id: Number(workflowId) } });
  if (!workflow || workflow.userId !== userId) throw new Error("Not allowed");

  return prisma.Action.findMany({
    where: { workflowId: Number(workflowId) },
    orderBy: { order: "asc" },
  });
};
