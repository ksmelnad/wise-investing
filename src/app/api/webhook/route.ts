import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/prisma";
import yahooFinance from "yahoo-finance2";

export async function GET() {
  return new NextResponse("Welcome to Wise Investing Telegram Webhook", {
    status: 200,
  });
}

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);

bot.setWebHook(process.env.TELEGRAM_WEBHOOK_URL!);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome to Wise Investing Guru! Please register by using /register <your-email>"
  );
});

bot.onText(/\/register (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  let email = "";

  if (match && match[1]) {
    email = match[1].trim();
  } else {
    bot.sendMessage(
      chatId,
      "Invalid command format. Please use /register <your-email>"
    );
    return;
  }

  try {
    // Check if the email exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Update the chatId for the user
      await prisma.user.update({
        where: { email },
        data: { telegramChatId: chatId.toString() },
      });

      bot.sendMessage(chatId, `Hi ${user.name}, your Telegram is now linked!`);
    } else {
      bot.sendMessage(
        chatId,
        "This email is not registered with us. Please register on our website first."
      );
    }
  } catch (error) {
    console.error("Error handling /register:", error);
    bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
});

bot.onText(/\/stock (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!match || !match[1]) {
    bot.sendMessage(chatId, "Usage: /stock <TICKER>");
    return;
  }
  const stock = match[1];
  //   console.log(stock);

  if (stock.length < 2) {
    bot.sendMessage(chatId, "Usage: /stock <TICKER>");
    return;
  }
  const ticker = stock.toUpperCase();
  try {
    // Fetch stock data using Yahoo Finance API
    const stockData = await yahooFinance.quote(ticker);
    // console.log(stockData);

    if (stockData && stockData.regularMarketPrice) {
      const price = stockData.regularMarketPrice;
      const changePercent = stockData.regularMarketChangePercent?.toFixed(2);
      const marketCap = stockData.marketCap
        ? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
        : "N/A";

      bot.sendMessage(
        chatId,
        `📈 ${ticker} Stock Price:\n` +
          `- Current Price: $${price}\n` +
          `- Change: ${changePercent}%\n` +
          `- Market Cap: ${marketCap}`
      );
    } else {
      bot.sendMessage(
        chatId,
        `Could not fetch price for ${ticker}. Please try again.`
      );
    }
  } catch (error: any) {
    console.error(error);
    bot.sendMessage(
      chatId,
      `Error fetching data for ${ticker}: ${error.message}`
    );
  }
});

// Disable polling and set up webhook
bot.stopPolling();

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);

  try {
    // Process the incoming update
    bot.processUpdate(body);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("This endpoint is for Telegram bot webhook", {
      status: 200,
    });
  }
}