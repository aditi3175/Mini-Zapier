import axios from "axios";

// Generic outgoing webhook. Sends the provided payload to config.url.
// Optional config.method (default POST), headers, and timeout.
export const callWebhook = async ({ config, payload }) => {
  const url = config.url;
  if (!url) throw new Error("Webhook url is missing");

  const method = (config.method || "POST").toUpperCase();
  const headers = config.headers || { "Content-Type": "application/json" };
  const timeout = Number(config.timeout || 10000);

  await axios({ url, method, data: payload, headers, timeout });
};
