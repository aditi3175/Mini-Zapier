import { workflowQueue } from "../DB/queue.js";

// Add a workflow to the queue
export const enqueueWorkflow = async (workflowId, actions, triggerId = null, payload = null) => {
  return workflowQueue.add("runWorkflow", { workflowId, actions, triggerId, payload });
};

// You can also add helpers for:
export const enqueueJob = async (jobName, data) => {
  return workflowQueue.add(jobName, data);
};
