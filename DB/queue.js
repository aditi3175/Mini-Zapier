import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisOptions = process.env.REDIS_URL 
  ? { 
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null 
    }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    };

const connection = new IORedis(redisOptions);

export const workflowQueue = new Queue("workflowActionQueue", {
  connection,
});
