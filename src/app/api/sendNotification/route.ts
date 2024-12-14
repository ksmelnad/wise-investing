// pages/api/check-stocks.js

import TelegramBot from "node-telegram-bot-api";
import yahooFinance from "yahoo-finance2";
import { prisma } from "@/lib/prisma"; // Ensure this points to your Prisma instance
import PortfolioWatchlist from "@/components/portfolioWatchlist";
import { getStocks } from "@/app/actions/actions";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);

export async function GET(request: Request) {
  const authToken = (await headers()).get("authorization");
  //   const authToken = request.headers.get("authorization");
  console.log("AuthToken", authToken);
  if (!authToken || authToken !== `Bearer ${process.env.CRON_JOB_API_KEY}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { portfolioStocks } = await getStocks();

  const session = await auth();
  const userEmail = session?.user?.email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const currentPricesPortfolioStocks = await Promise.all(
      portfolioStocks.map(async (stock) => {
        // const fields = ["regularMarketPrice", "regularMarketTime"] as const;
        const quote = await yahooFinance.quoteCombine(stock.symbol);
        // console.log(quote);
        // Populate generalStocks's current price with quote's regularMarketPrice
        if (!quote) {
          console.error(`Error fetching quote for ${stock.symbol}`);
          return; // or throw an error, depending on your requirements
        }
        if (!quote.regularMarketPrice) {
          console.error(`Missing regularMarketPrice field for ${stock.symbol}`);
          return; // or throw an error, depending on your requirements
        }
        stock.currentPrice = quote.regularMarketPrice!;
        stock.change = quote.regularMarketChange!;
        stock.changePercent = quote.regularMarketChangePercent!;
        stock.fiftyDayAverage = quote.fiftyDayAverage!;
        stock.fiftyDayAverageChange = quote.fiftyDayAverageChange!;
        stock.fiftyDayAverageChangePercent =
          quote.fiftyDayAverageChangePercent!;
        stock.twoHundredDayAverage = quote.twoHundredDayAverage!;
        stock.twoHundredDayAverageChange = quote.twoHundredDayAverageChange!;
        stock.twoHundredDayAverageChangePercent =
          quote.twoHundredDayAverageChangePercent!;

        // return quote;
      })
    );

    portfolioStocks.map(async (stock) => {
      const { currentPrice, purchasePrice } = stock;

      // Calculate the percentage change
      const changePercent =
        ((currentPrice! - purchasePrice!) / purchasePrice!) * 100;

      // Check if the change exceeds ±3%
      if (Math.abs(changePercent) >= 3) {
        const message = `==========/n
📈 ${stock.symbol} Alert:
- Purchase Price: $${purchasePrice?.toFixed(2)}
- Current Price: $${currentPrice?.toFixed(2)}
- Change: ${changePercent.toFixed(2)}%`;

        // Send a notification to the user
        await bot.sendMessage(user.telegramChatId!, message);
      }
    });
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error checking stocks:", error);
    return new NextResponse("Error checking stocks", { status: 500 });
  }
}
