import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

let connection;

if (process.env.REDIS_URL) {
  // Use URL directly - IORedis accepts URL as first argument
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: false,
  });
} else {
  // Fallback to individual options
  connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: false,
  });
}

export const workflowQueue = new Queue("workflowActionQueue", {
  connection,
});
