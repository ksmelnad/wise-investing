"use server";

import { subscribeToSymbol, unsubscribeFromSymbol } from "@/utils/websocket";

export async function subscribeToWatchlist(stocks: { symbol: string }[]) {
  const promises = stocks.map(
    (stock) =>
      new Promise((resolve) => {
        subscribeToSymbol(stock.symbol, (data) => {
          resolve({ symbol: stock.symbol, ...data });
        });
      })
  );

  const stockData = await Promise.all(promises);
  console.log(stockData);
  return stockData;
}

export async function unsubscribeFromWatchlist(stocks: { symbol: string }[]) {
  stocks.forEach((stock) => unsubscribeFromSymbol(stock.symbol));
}
