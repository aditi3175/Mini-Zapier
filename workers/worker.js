import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../DB/db.js";
import { sendSlackMessage } from "../integrations/slack.js";
import { sendEmail } from "../integrations/email.js";
import { callWebhook } from "../integrations/webhook.js";

const connection = new IORedis({
  maxRetriesPerRequest: null, // ✅ Required for BullMQ
});
const prisma = new PrismaClient();

const worker = new Worker(
  "workflowActionQueue",
  async (job) => {
    console.log(`Running workflow ${job.id}`);

    const { workflowId, actions, payload } = job.data;

    // Create job log in DB
    const dbJob = await prisma.Job.create({
      data: {
        workflowId,
        status: "running",
        payload,
        attempts: 0,
      },
    });

    try {
      for (const action of actions) {
        console.log(`Executing action: ${action.type}`);

        switch (action.type) {
          case "sendEmail":
            await sendEmail({ config: action.config, payload });
            break;
          case "slackMessage":
            await sendSlackMessage({ config: action.config, payload });
            break;
          case "webhook":
            await callWebhook({ config: action.config, payload });
            break;
          default:
            console.log(`Unknown action type: ${action.type}`);
        }

        // simulate some delay between actions
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

        // Update job log as success
        await prisma.Job.update({
          where: { id: dbJob.id },
          data: { status: "success" },
        });

        console.log(`Workflow ${job.id} completed`);
      } catch (err) {
      console.error(`Workflow ${job.id} failed:`, err.message);

      // Update job log as failed
      await prisma.Job.update({
        where: { id: dbJob.id },
        data: {
          status: "failed",
          lastError: err.message,
          attempts: job.attemptsMade + 1,
        },
      });
      // Throw error so BullMQ can retry
      throw err;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} finished successfully`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed: ${err.message}`);
});