// watchlist.ts

import NodeCache from "node-cache";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import yahooFinance from "yahoo-finance2";
import { AddStock } from "./dashboard/addStock";
import { getUserWatchlists } from "@/app/actions/actions";
import { AddManyStocks } from "./dashboard/addManyStocks";
import { CreateWatchlist } from "./dashboard/createWatchlist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma, Watchlist as WatchlistType } from "@prisma/client";

const CACHE_TTL = 30 * 60; // 5 minutes in seconds
const stockCache = new NodeCache({ stdTTL: CACHE_TTL });

/**
 * The shape of the quote from Yahoo Finance.
 */
type StockQuote = {
  regularMarketPrice?: number;
  currency?: string;
  marketCap?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
};

/**
 * Fetch a stock quote. In production, we skip the cache
 * and fetch fresh data from yahooFinance. In dev, we
 * attempt to return from cache, else fetch fresh.
 */
async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `stock_${symbol}`;

  // In production, always fetch fresh data.
  if (process.env.NODE_ENV === "production") {
    return yahooFinance.quoteCombine(symbol);
  }

  // Otherwise, use caching in dev:
  const cachedData = stockCache.get<StockQuote>(cacheKey);
  if (cachedData) {
    console.log(`[DEV] Using cached data for ${symbol}`);
    return cachedData;
  }

  // Fetch fresh data and store in cache
  console.log(`[DEV] Fetching fresh data for ${symbol}`);
  try {
    const quote = await yahooFinance.quoteCombine(symbol);
    if (quote?.regularMarketPrice) {
      stockCache.set(cacheKey, quote);
    }
    return quote;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    throw error;
  }
}

/**
 * This is the type we get back from Prisma (including the "stocks" relation).
 */
export type UserWatchlist = Prisma.WatchlistGetPayload<{
  include: {
    stocks: true;
  };
}>;

/**
 * Helper function to compute percent change from purchasePrice to currentPrice.
 */
function calculateChangePercent(
  purchasePrice: number,
  currentPrice: number
): number {
  const change = ((currentPrice - purchasePrice) / purchasePrice) * 100;
  return Number(change.toFixed(2));
}

/**
 * Helper function to compute absolute change from purchasePrice to currentPrice.
 */
function calculateChange(purchasePrice: number, currentPrice: number): number {
  const change = currentPrice - purchasePrice;
  return Number(change.toFixed(2));
}

/**
 * Fetches watchlists from the DB, enriches with Yahoo Finance quotes,
 * and returns the updated data.
 */
async function getProcessedWatchlists(): Promise<UserWatchlist[]> {
  const watchlists = await getUserWatchlists();

  const processedWatchlists = await Promise.all(
    watchlists.map(async (watchlist) => {
      // Enrich each stock
      const updatedStocks = await Promise.all(
        watchlist.stocks.map(async (stock) => {
          const quote = await getStockQuote(stock.symbol);

          // If there is no quote, keep it as-is to avoid errors
          if (!quote) {
            console.error(`Error fetching quote for ${stock.symbol}`);
            return stock;
          }

          return {
            ...stock,
            currentPrice: quote.regularMarketPrice ?? null,
            currency: quote.currency ?? null,
            marketCap: quote.marketCap ?? null,
            change: stock.purchasePrice
              ? calculateChange(
                  stock.purchasePrice,
                  quote.regularMarketPrice ?? 0
                )
              : quote.regularMarketChange ?? null,
            changePercent: stock.purchasePrice
              ? calculateChangePercent(
                  stock.purchasePrice,
                  quote.regularMarketPrice ?? 0
                )
              : quote.regularMarketChangePercent ?? null,
          };
        })
      );

      // Return a new watchlist object with updated stocks
      return {
        ...watchlist,
        stocks: updatedStocks,
      };
    })
  );

  return processedWatchlists;
}

const Watchlist = async () => {
  // 1. Fetch + Enrich watchlist data
  const processedWatchlists = await getProcessedWatchlists();

  // 2. Return UI, using newly populated data
  return (
    <section className="max-w-7xl mx-auto">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Watchlists</h2>
          <CreateWatchlist />
        </div>

        <Tabs
          defaultValue={processedWatchlists[0]?.id ?? "portfolio"}
          className="w-full"
        >
          <TabsList className="mb-4">
            {processedWatchlists.map((list) => (
              <TabsTrigger key={list.id} value={list.id}>
                {list.name.charAt(0).toUpperCase() + list.name.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {processedWatchlists.map((list) => (
            <TabsContent key={list.id} value={list.id}>
              <div className="flex flex-col gap-y-4">
                <div className="flex gap-x-4">
                  <AddStock watchlistName={list.name} />
                  <AddManyStocks watchlistName={list.name} />
                </div>
                {/* 
                  Here, we pass in the updated stocks (enriched with 
                  currentPrice, change, changePercent, etc.). 
                */}
                <DataTable
                  columns={columns}
                  data={list.stocks}
                  watchlists={processedWatchlists}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Watchlist;
