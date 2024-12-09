"use server";

import { prisma } from "@/lib/prisma";
import yahooFinance from "yahoo-finance2";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createDefaultWatchlists() {
  const session = await auth();
  const userId = session?.user?.id;
  console.log(userId);
  if (!userId) {
    throw new Error("User not found");
  }
  const result = await prisma.watchlist.createMany({
    data: [
      { userId, watchListType: "general" },
      { userId, watchListType: "portfolio" },
    ],
  });

  console.log(result);
}

export async function getWatchlist() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  return await prisma.watchlist.findMany({
    where: { userId },
  });
}

export async function addStockToWatchlist({
  symbol,
  name,
  watchlistType,
  purchasePrice,
}: {
  watchlistType: string;
  symbol: string;
  name: string;
  purchasePrice?: number;
}) {
  try {
    const session = await auth();

    const user = await prisma.user.findFirst({
      where: { email: session?.user?.email },
    });
    const userId = user?.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId, watchListType: watchlistType },
    });

    if (!watchlist) {
      createDefaultWatchlists();
    }

    // TODO: If stock already exists, dont add

    if (watchlistType === "portfolio") {
      const stockCreate = await prisma.stock.create({
        data: {
          watchlistId: watchlist?.id as string,
          symbol,
          name,
          purchasePrice,
        },
      });
    } else {
      const stockCreate = await prisma.stock.create({
        data: {
          watchlistId: watchlist?.id as string,
          symbol,
          name,
        },
      });
    }

    revalidatePath("/dashboard");

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
export async function getStockData(symbol: string) {
  const results = await yahooFinance.quote(symbol);

  return results;
}