"use server";

import prisma from "@/lib/prisma";
import { Prisma, type Watchlist as WatchlistPrismaType } from "@prisma/client";
import yahooFinance from "yahoo-finance2";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createDefaultWatchlists() {
  const session = await auth();

  const userEmail = session?.user?.email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const userId = user.id;

  const result = await prisma.watchlist.createMany({
    data: [
      { userId, name: "general" },
      { userId, name: "portfolio" },
    ],
  });

  return result;
}

export async function createWatchlist(name: string) {
  const session = await auth();
  const userEmail = session?.user?.email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;

  const result = await prisma.watchlist.create({
    data: { userId, name },
  });

  revalidatePath("/dashboard/watchlists");

  return result;
}

export async function getUserWatchlists() {
  const session = await auth();
  const userEmail = session?.user?.email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return await prisma.watchlist.findMany({
    where: { userId: user.id },
    include: {
      stocks: true,
    },
  });
}

export async function addStockToWatchlist({
  symbol,

  stockName,
  watchlistName,
  purchasePrice,
}: {
  symbol: string;
  stockName: string;
  watchlistName: string;
  purchasePrice?: number;
}) {
  try {
    const session = await auth();
    console.log("Session in addStock:", session);

    const user = await prisma.user.findFirst({
      where: { email: session?.user?.email },
    });
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId, name: watchlistName },
    });

    // TODO: If stock already exists, dont add

    if (watchlistName === "general") {
      const stockCreate = await prisma.stock.create({
        data: {
          watchlistId: watchlist?.id as string,
          symbol,
          name: stockName,
        },
      });
    } else {
      const stockCreate = await prisma.stock.create({
        data: {
          watchlistId: watchlist?.id as string,
          symbol,
          name: stockName,
          purchasePrice,
        },
      });
    }

    revalidatePath("/dashboard/watchlists");

    return {
      success: true,
      message: "Stock added to watchlist",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getStocksInWatchlist(watchlistId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  return await prisma.stock.findMany({
    where: { watchlistId },
  });
}

export async function getStocks() {
  const session = await auth();
  const userEmail = session?.user?.email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const myWatchlists = await prisma.watchlist.findMany({
    where: { userId: user.id },
    include: {
      stocks: true,
    },
  });

  const portfolioStocks = myWatchlists.filter(
    (watchlist: WatchlistPrismaType) => watchlist.name === "portfolio"
  )[0]?.stocks;

  const generalStocks = myWatchlists.filter(
    (watchlist: WatchlistPrismaType) => watchlist.name === "general"
  )[0]?.stocks;

  return {
    portfolioStocks,
    generalStocks,
  };
}

export async function updateStock({
  stockId,
  symbol,
  name,
  purchasePrice,
}: {
  stockId: string;
  symbol?: string;
  name?: string;
  purchasePrice?: number;
}) {
  return await prisma.stock.update({
    where: { id: stockId },
    data: { symbol, name, purchasePrice },
  });
}

export async function removeStock(stockId: string) {
  try {
    await prisma.stock.delete({
      where: { id: stockId },
    });
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Stock removed from watchlist",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error removing stock from watchlist",
    };
  }
}

export async function moveStocksToWatchlist({
  stockIds,
  destinationWatchlistId,
}: {
  stockIds: string[];
  destinationWatchlistId: string;
}) {
  if (!stockIds?.length || !destinationWatchlistId) return;

  await prisma.stock.updateMany({
    where: {
      id: { in: stockIds },
    },
    data: {
      watchlistId: destinationWatchlistId,
    },
  });

  revalidatePath("/dashboard/watchlists");
}
