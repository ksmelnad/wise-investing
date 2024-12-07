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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// import { getStockData } from "@/app/actions";
import yahooFinance from "yahoo-finance2";
import { getStockData, removeStock } from "@/app/actions";
import AddStock from "./dashboard/addStock";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Edit, Trash } from "lucide-react";
import DelStockBtn from "./dashboard/delStockBtn";

const Watchlist = async () => {
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
    generalStocks.map(async (stock) => {
      // const fields = ["regularMarketPrice", "regularMarketTime"] as const;
      const quote = await yahooFinance.quoteCombine(stock.symbol);
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

  // console.log("CURRENT PRICES", currentPricesGeneralStocks);

  return (
    <section className="max-w-5xl mx-auto ">
      <div>
        <AddStock />
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Portfolio Watchlist</h3>
            <p className="text-sm">
              Your purchased stocks and their performance
            </p>
          </CardHeader>
          <CardContent className="">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold p-2">Ticker</TableHead>
                  <TableHead className="font-bold p-2">Company Name</TableHead>
                  <TableHead className="font-bold p-2">
                    Purchase Price
                  </TableHead>
                  <TableHead className="font-bold p-2">Current Price</TableHead>
                  <TableHead className="font-bold p-2">Change</TableHead>
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
                    {/* <TableCell
                        className={`p-2 ${
                          stock.change.startsWith("+")
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stock.change}
                      </TableCell> */}
                    <TableCell className="p-2">Change</TableCell>
                    <TableCell className="p-2 flex items-center gap-2 ">
                      <Edit size={16} color="purple" />
                      <Dialog>
                        <DialogTrigger>
                          <Trash size={16} color="red" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete stock</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this stock?
                            </DialogDescription>
                          </DialogHeader>
                          <h3 className="font-bold">{stock.symbol}</h3>
                          <p>{stock.name}</p>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>

                            <DialogClose asChild>
                              <DelStockBtn stockId={stock.id} />
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col"></CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">General Watchlist</h3>
            <p className="text-sm">Your general stocks and their performance</p>
          </CardHeader>
          <CardContent>
            <Table className="w-full text-left border-collapse">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold p-2">Ticker</TableHead>
                  <TableHead className="font-bold p-2">Company Name</TableHead>

                  <TableHead className="font-bold p-2">Current Price</TableHead>
                  <TableHead className="font-bold p-2">Change</TableHead>
                  <TableHead className="font-bold p-2">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalStocks.map((stock, index) => (
                  <TableRow key={index} className="hover:bg-gray-100">
                    <TableCell className="p-2">{stock.symbol}</TableCell>
                    <TableCell className="p-2">{stock.name}</TableCell>

                    <TableCell className="p-2">
                      ${stock.currentPrice?.toFixed(2)}
                    </TableCell>
                    {/* <TableCell
                      className={`p-2 ${
                        stock.change.startsWith("+")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stock.change}
                    </TableCell> */}
                    <TableCell className="p-2">Change</TableCell>
                    <TableCell className="p-2 ">
                      <Dialog>
                        <DialogTrigger>
                          <Trash size={16} color="red" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete stock</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this stock?
                            </DialogDescription>
                          </DialogHeader>
                          <h3 className="font-bold">{stock.symbol}</h3>
                          <p>{stock.name}</p>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>

                            <DialogClose asChild>
                              <DelStockBtn stockId={stock.id} />
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {/* <CardFooter className="flex justify-end p-4 bg-gray-50 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Detailed Report
            </Button>
          </CardFooter> */}
        </Card>
      </div>
    </section>
  );
};

export default Watchlist;
