"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addStockToWatchlist } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface Stock {
  symbol: string;
  name: string;
  type: number;
}
const AddStock = () => {
  const [searchResultPopup, setSearchResultPopup] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState<Stock[] | []>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("general");
  const [selectedStockPurchasePrice, setSelectedStockPurchasePrice] =
    useState<number>(0.0);

  const { toast } = useToast();

  const handleSearch = async () => {
    // Implement search functionality here
    console.log("Searching for symbol:", symbol);
    try {
      const response = await axios.get(
        `https://marketplace.financialmodelingprep.com/public/search?query=${symbol}`
      );
      const data = response.data;
      const { stock } = data;
      setStockData(stock);
      console.log(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // const handleYSearch = async () => {
  //   const results = await getStockData("TSLA");
  //   console.log(results);
  // };

  const handleAddStock = async () => {
    if (selectedStock) {
      try {
        const response = await addStockToWatchlist({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          watchlistType: selectedWatchlist,
          purchasePrice: selectedStockPurchasePrice,
        });

        if (response.success === true) {
          toast({
            description: response.message,
          });
        } else {
          toast({
            variant: "destructive",

            description: response.message,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong",
        });
      }
    }
  };

  return (
    <div className="relative">
      <div className="">
        <h3 className="font-bold text-lg mb-2 pt-4">Search Stock</h3>
        <div className="flex items-center justify-between mb-4 gap-x-2 w-[400px]">
          <Input
            id="search"
            placeholder="Ex. AAPL"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="submit" onClick={handleSearch}>
                Search
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]" align="end">
              {stockData &&
                stockData.length > 0 &&
                stockData.map((stock, index) => (
                  <div key={index} className="flex justify-between gap-2">
                    <div className="flex flex-col mb-2">
                      <span className="font-bold text-sm">{stock.symbol}</span>
                      <span className="text-sm">{stock.name}</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedStock(stock)}
                        >
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add stock</DialogTitle>
                          <DialogDescription>
                            Add stock to your watchlist.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <h3 className="font-bold">{stock.symbol}</h3>
                          <p className="text-sm">{stock.name}</p>
                        </div>
                        <RadioGroup
                          value={selectedWatchlist}
                          onValueChange={setSelectedWatchlist}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="r2" />
                            <Label htmlFor="r2">General</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="portfolio" id="r1" />
                            <Label htmlFor="r1">Portfolio</Label>
                          </div>
                        </RadioGroup>
                        {selectedWatchlist === "portfolio" && (
                          <div>
                            <Label htmlFor="purchasePrice">
                              Purchase Price
                            </Label>
                            <Input
                              id="purchasePrice"
                              type="number"
                              step="0.01"
                              value={selectedStockPurchasePrice}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || isNaN(parseFloat(value))) {
                                  setSelectedStockPurchasePrice(0.0); // Or set it to 0, depending on your needs
                                } else {
                                  setSelectedStockPurchasePrice(
                                    parseFloat(value)
                                  );
                                }
                              }}
                              placeholder="Purchase Price"
                            />
                          </div>
                        )}

                        <DialogFooter className="sm:justify-start">
                          <DialogClose asChild>
                            <Button onClick={handleAddStock}>Add</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="secondary">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default AddStock;
