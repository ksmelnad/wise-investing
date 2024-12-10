import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import yahooFinance from "yahoo-finance2";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const algos = [
  {
    title: "Algo 1",
    description: "Simple Moving Average",
  },
  {
    title: "Algo 2",
    description: "Price Limit Order",
  },
];
const page = async () => {
  const session = await auth();

  const myWatchlists = await prisma.watchlist.findMany({
    where: { userId: session?.user?.id },
    include: {
      stocks: true,
    },
  });

  // console.log("My stocks", myWatchlists);

  const portfolioStocks = myWatchlists.filter(
    (watchlist) => watchlist.watchListType === "portfolio"
  )[0]?.stocks;

  const generalStocks = myWatchlists.filter(
    (watchlist) => watchlist.watchListType === "general"
  )[0]?.stocks;

  const currentPricesGeneralStocks = await Promise.all(
    portfolioStocks.map(async (stock) => {
      // const fields = ["regularMarketPrice", "regularMarketTime"] as const;
      const quote = await yahooFinance.quoteCombine(stock.symbol);
      console.log(quote);
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
      stock.fiftyDayAverageChangePercent = quote.fiftyDayAverageChangePercent!;
      stock.twoHundredDayAverage = quote.twoHundredDayAverage!;
      stock.twoHundredDayAverageChange = quote.twoHundredDayAverageChange!;
      stock.twoHundredDayAverageChangePercent =
        quote.twoHundredDayAverageChangePercent!;

      // return quote;
    })
  );

  const currentPricesPortfolioStocks = await Promise.all(
    portfolioStocks.map(async (stock) => {
      // const fields = ["regularMarketPrice", "regularMarketTime"] as const;
      const quote = await yahooFinance.quoteCombine(stock.symbol);
      if (!quote) {
        console.error(`Error fetching quote for ${stock.symbol}`);
        return; // or throw an error, depending on your requirements
      }
      if (!quote.regularMarketPrice) {
        console.error(`Missing regularMarketPrice field for ${stock.symbol}`);
        return; // or throw an error, depending on your requirements
      }

      stock.currentPrice = quote.regularMarketPrice!;
    })
  );

  const calculateChangePercent = (
    purchasePrice: number,
    currentPrice: number
  ) => {
    const change = ((currentPrice - purchasePrice) / purchasePrice) * 100;
    return change.toFixed(2);
  };

  const calculateChange = (purchasePrice: number, currentPrice: number) => {
    const change = currentPrice - purchasePrice;
    return Number(change.toFixed(2));
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Portfolio Watchlist</h3>
          <p className="text-sm">Your purchased stocks and their performance</p>
        </CardHeader>
        <CardContent className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold p-2">Ticker</TableHead>
                <TableHead className="font-bold p-2">Company Name</TableHead>
                <TableHead className="font-bold p-2">Purchase Price</TableHead>
                <TableHead className="font-bold p-2">Current Price</TableHead>
                <TableHead className="font-bold p-2">50d SMA</TableHead>
                <TableHead className="font-bold p-2">50d SMA Change</TableHead>
                <TableHead className="font-bold p-2">
                  50d SMA Change %{" "}
                </TableHead>
                <TableHead className="font-bold p-2">200d SMA</TableHead>
                <TableHead className="font-bold p-2">200d SMA Change</TableHead>
                <TableHead className="font-bold p-2">
                  200d SMA Change %
                </TableHead>
                <TableHead className="font-bold p-2">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioStocks.map((stock, index) => (
                <TableRow key={index} className="hover:bg-gray-100">
                  <TableCell className="p-2">{stock.symbol}</TableCell>
                  <TableCell className="p-2">{stock.name}</TableCell>
                  <TableCell className="p-2 text-green-600">
                    ${stock.purchasePrice}
                  </TableCell>
                  <TableCell className="p-2">${stock.currentPrice}</TableCell>
                  <TableCell className="p-2">
                    ${stock.fiftyDayAverage?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    ${stock.fiftyDayAverageChange?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    ${stock.fiftyDayAverageChangePercent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    ${stock.twoHundredDayAverage?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    ${stock.twoHundredDayAverageChange?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    ${stock.twoHundredDayAverageChangePercent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2 flex items-center gap-2 ">
                    Edit
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col"></CardFooter>
      </Card>
    </div>
  );
};

export default page;
