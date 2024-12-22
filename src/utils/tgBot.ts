import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);
bot.setWebHook(process.env.TELEGRAM_WEBHOOK_URL!);

export default bot;
