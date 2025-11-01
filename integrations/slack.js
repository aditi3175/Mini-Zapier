import axios from "axios";

// Sends a Slack message using an incoming webhook URL.
// Expects worker to pass a resolved config. Supports either
// config.webhookUrl or config.webhook_url and a message text.
export const sendSlackMessage = async ({ config, payload }) => {
  const webhookUrl = config.webhookUrl || config.webhook_url;
  if (!webhookUrl) {
    throw new Error("Slack webhook URL is missing. Please provide a webhook URL in the action configuration.");
  }

  // Validate webhook URL format (basic check)
  if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
    throw new Error("Invalid webhook URL format. Must start with http:// or https://");
  }

  const text = config.text || config.message || JSON.stringify({ payload });
  
  if (!text || text.trim() === '') {
    throw new Error("Slack message text is empty. Please provide a message text.");
  }

  try {
    const response = await axios.post(
      webhookUrl,
      { text },
      { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Slack returns "ok" on success
    if (response.data !== 'ok' && response.status !== 200) {
      throw new Error(`Slack API error: ${response.statusText || 'Unknown error'}`);
    }
    
    return { success: true, message: "Slack message sent successfully" };
  } catch (error) {
    if (error.response) {
      // Slack API returned an error response
      const errorMsg = error.response.data?.error || error.response.statusText || 'Unknown error';
      throw new Error(`Slack API error: ${errorMsg} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Failed to connect to Slack. Please check your webhook URL and internet connection.");
    } else {
      // Something else happened
      throw new Error(`Slack error: ${error.message || 'Unknown error'}`);
    }
  }
};
