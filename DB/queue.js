import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

export const workflowQueue = new Queue("workflowActionQueue", {
  connection,
});
