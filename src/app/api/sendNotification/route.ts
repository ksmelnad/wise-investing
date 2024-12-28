import TelegramBot from "node-telegram-bot-api";
import yahooFinance from "yahoo-finance2";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);

export async function GET() {
  const authToken = (await headers()).get("authorization");
  if (!authToken || authToken !== `Bearer ${process.env.CRON_JOB_API_KEY}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all users with their watchlists and telegramChatId
    const usersWithWatchlists = await prisma.user.findMany({
      where: { telegramChatId: { not: null } },
      include: {
        watchlists: {
          where: { name: "portfolio" },
          include: {
            stocks: true, // Fetch stocks for each watchlist
          },
        },
      },
    });

    console.log("Users with watchlists:", usersWithWatchlists);

    if (!usersWithWatchlists.length) {
      console.warn("No users with watchlists found.");
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    // Iterate over users
    const notifications = usersWithWatchlists.map(async (user) => {
      const { telegramChatId, watchlists } = user;

      // Process each watchlist for the user
      const watchlistMessages = await Promise.all(
        watchlists.map(async (watchlist) => {
          const stockMessages = await Promise.all(
            watchlist.stocks.map(async (stock) => {
              try {
                const quote = await yahooFinance.quoteCombine(stock.symbol);
                if (!quote?.regularMarketPrice) return null;

                const currentPrice = quote.regularMarketPrice;
                const changePercent =
                  ((currentPrice - stock.purchasePrice!) /
                    stock.purchasePrice!) *
                  100;

                if (Math.abs(changePercent) >= 3) {
                  if (
                    Math.floor(stock.lastNotifiedPercent!) !==
                    Math.floor(changePercent)
                  ) {
                    await prisma.stock.update({
                      where: { id: stock.id },
                      data: { lastNotifiedPercent: changePercent },
                    });

                    return `
📈 ${stock.symbol}:
- Name: ${stock.name}
- Purchase Price: $${stock.purchasePrice?.toFixed(2) || "N/A"}
- Current Price: $${currentPrice.toFixed(2)}
- Change: ${changePercent.toFixed(2)}%`;
                  }
                }
                return null;
              } catch (err) {
                console.error(`Error processing stock ${stock.symbol}:`, err);
                return null;
              }
            })
          );

          // Filter out null or undefined stock messages
          const validStockMessages = stockMessages.filter(Boolean);

          if (validStockMessages.length > 0) {
            return `
===== Watchlist: ${watchlist.name} =====
${validStockMessages.join("\n")}`;
          }
          return null;
        })
      );

      // Consolidate all watchlist messages for the user
      const userMessage = watchlistMessages.filter(Boolean).join("\n");

      if (userMessage) {
        await bot.sendMessage(
          telegramChatId!,
          `Hello! Here are your stock updates:\n${userMessage}`
        );
      }
    });

    // Wait for all notifications to be processed
    await Promise.all(notifications);

    return NextResponse.json(
      { message: "Stock notifications sent" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in GET handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
