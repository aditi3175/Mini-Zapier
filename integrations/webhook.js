import axios from "axios";

export const callWebhook = async ({ config, payload }) => {
  await axios.post(config.url, payload);
};
