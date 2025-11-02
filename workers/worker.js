import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../DB/db.js";
import { sendSlackMessage } from "../integrations/slack.js";
import { sendEmail } from "../integrations/email.js";
import { callWebhook } from "../integrations/webhook.js";

// Placeholder replacement function
// Supports both {{payload.data.key}} and {{data.key}}
const replacePlaceholders = (str, payload) => {
  if (typeof str !== "string") return str;
  return str.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const keys = rawPath.trim().split(".");
    // Allow optional leading "payload" segment
    if (keys[0] === "payload") keys.shift();
    let value = payload;
    for (const key of keys) {
      if (value == null || typeof value !== "object" || !(key in value)) return "";
      value = value[key];
    }
    return value == null ? "" : String(value);
  });
};

// Redis connection for BullMQ
let connection;

if (process.env.REDIS_URL) {
  // Use URL directly - IORedis accepts URL as first argument
  console.log("🔗 Connecting to Redis using REDIS_URL");
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: false,
  });
} else {
  // Fallback to individual options
  console.log("🔗 Connecting to Redis using host/port");
  connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: false,
  });
}

connection.on('connect', () => {
  console.log('✅ Redis connected successfully!');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

connection.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

console.log('🚀 Starting Worker...');
console.log('📋 Queue name: workflowActionQueue');

// Create the Worker
const worker = new Worker(
  "workflowActionQueue",
  async (job) => {
    console.log(`📥 Job received: ${job.id} (${job.name})`);
    console.log(`Running workflow ${job.id}`);
    const { workflowId, actions, payload, triggerId } = job.data;

    // Log the job in DB
    const dbJob = await prisma.job.create({
      data: {
        workflow: { connect: { id: workflowId } },
        status: "RUNNING",
        payload,
        attempts: 0,
        triggerId: triggerId || null,
      },
    });

    try {
      const results = [];
      // Execute actions sequentially
      for (const action of actions) {
        console.log(`Executing action: ${action.type}`);

        // Resolve dynamic placeholders in action config
        const resolvedConfig = {};
        for (const key in action.config) {
          resolvedConfig[key] = replacePlaceholders(action.config[key], payload);
        }

        let actionResult = { type: action.type, ok: true };
        // Execute action based on type
        try {
          switch (action.type) {
            case "sendEmail": {
              const info = await sendEmail({ config: resolvedConfig, payload });
              actionResult = { ...actionResult, info: info || null };
              break;
            }
            case "slackMessage": {
              await sendSlackMessage({ config: resolvedConfig, payload });
              actionResult = { ...actionResult, message: "Slack message sent successfully" };
              break;
            }
            case "webhook": {
              const result = await callWebhook({ config: resolvedConfig, payload });
              actionResult = { ...actionResult, ...(result || {}) };
              break;
            }
            default:
              actionResult.ok = false;
              actionResult.error = `Unknown action type: ${action.type}`;
          }
        } catch (actionErr) {
          // Catch individual action errors but continue with other actions
          console.error(`Action ${action.type} failed:`, actionErr.message);
          actionResult.ok = false;
          actionResult.error = actionErr.message || "Action execution failed";
          // Still include resolved config for debugging
          actionResult.config = resolvedConfig;
        }

        results.push(actionResult);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Update job as SUCCESS with results
      await prisma.job.update({
        where: { id: dbJob.id },
        data: { status: "SUCCESS", result: { actions: results } },
      });

      console.log(`Workflow ${job.id} completed successfully`);

    } catch (err) {
      console.error(`Workflow ${job.id} failed: ${err.message}`);

      // Update job as FAILED
      await prisma.job.update({
        where: { id: dbJob.id },
        data: {
          status: "FAILED",
          lastError: err.message,
          attempts: job.attemptsMade + 1,
        },
      });

      // Throw error so BullMQ can retry if needed
      throw err;
    }
  },
  { connection }
);

// Event listeners
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} finished successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

worker.on("error", (err) => {
  console.error(`❌ Worker error:`, err);
});

worker.on("ready", () => {
  console.log('✅ Worker is ready and listening for jobs');
});

console.log('✅ Worker initialized successfully');
