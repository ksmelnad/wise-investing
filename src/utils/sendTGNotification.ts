import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const CHAT_ID = "your_chat_id"; // Replace with your chat ID

export const sendTelegramNotification = async (
  message: string
): Promise<void> => {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(telegramUrl, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
};
