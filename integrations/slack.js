import axios from "axios";

export const sendSlackMessage = async ({ config, payload }) => {
  await axios.post(config.webhook_url, {
    text: `New signup: ${payload.user.name} (${payload.user.email})`,
  });
};
