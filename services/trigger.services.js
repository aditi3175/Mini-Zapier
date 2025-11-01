import prisma from "../DB/db.js";

// Create a trigger for a workflow
export const createTrigger = async (userId, { workflowId, type, config }) => {
  const workflow = await prisma.Workflow.findUnique({ where: { id: Number(workflowId) } });
  if (!workflow || workflow.userId !== userId) throw new Error("Not allowed");

  return prisma.Trigger.create({ data: { workflowId: Number(workflowId), type, config } });
};

// Get all triggers of a workflow
export const getWorkflowTriggers = async (workflowId, userId) => {
  const workflow = await prisma.Workflow.findUnique({ where: { id: Number(workflowId) } });
  if (!workflow || workflow.userId !== userId) throw new Error("Not allowed");

  return prisma.Trigger.findMany({ where: { workflowId: Number(workflowId) } });
};
