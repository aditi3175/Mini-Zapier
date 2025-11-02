import axios from "axios";

// Generic outgoing webhook. Sends the provided payload to config.url.
// Optional config.method (default POST), headers, and timeout.
export const callWebhook = async ({ config, payload }) => {
  const url = config.url;
  if (!url) throw new Error("Webhook url is missing");

  const method = (config.method || "POST").toUpperCase();
  const headers = config.headers || { "Content-Type": "application/json" };
  const timeout = Number(config.timeout || 10000);

  console.log("🔗 Webhook call details:");
  console.log("  URL:", url);
  console.log("  Method:", method);
  console.log("  Headers:", JSON.stringify(headers, null, 2));
  console.log("  Payload:", JSON.stringify(payload, null, 2).substring(0, 200) + "...");

  try {
    const response = await axios({ 
      url, 
      method, 
      data: payload, 
      headers, 
      timeout,
      validateStatus: () => true, // Don't throw on any status code
    });
    
    console.log("✅ Webhook response:", response.status, response.statusText);
    
    if (response.status >= 400) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText || 'Bad Request'}`);
    }
    
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    if (error.response) {
      console.error("  Status:", error.response.status);
      console.error("  Response:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("  No response received");
    }
    throw error;
  }
};
