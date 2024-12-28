"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { addStockToWatchlist } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Stock {
  symbol: string;
  name: string;
  type: number;
}

const addStockSchema = z.object({
  symbol: z.string().min(1, { message: "Symbol is required" }),
  name: z.string().optional(),
  purchasePrice: z.coerce
    .number({ invalid_type_error: "Purchase Price must be a number" })
    .positive("Purchase price must be a positive number")
    .optional(),
});

type AddStockFormValues = z.infer<typeof addStockSchema>;

interface AddStockProps {
  watchlistName: string; // We receive this from the parent
  onStockAdded?: () => void; // Callback if you want to trigger parent actions after adding
}

export function AddStock({ watchlistName, onStockAdded }: AddStockProps) {
  const { toast } = useToast();

  // single symbol search
  const [symbolSearchTerm, setSymbolSearchTerm] = useState("");
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // react-hook-form instance
  const form = useForm<AddStockFormValues>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      symbol: "",
      purchasePrice: undefined,
    },
  });

  // 1. Search for a single symbol
  const handleSearchSymbol = async () => {
    try {
      const response = await axios.get(
        `https://marketplace.financialmodelingprep.com/public/search?query=${symbolSearchTerm}`
      );
      const { stock } = response.data;
      setStockData(stock);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStockData([]);
    }
  };

  // 2. When user selects "Add" from the popover, open a Dialog with that stock
  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    form.setValue("symbol", stock.symbol);
    form.setValue("name", stock.name);
  };

  // 3. Submit the form -> calls addStockToWatchlist
  const onSubmit = async (values: AddStockFormValues) => {
    if (!selectedStock) return;

    try {
      const response = await addStockToWatchlist({
        symbol: values.symbol,
        stockName: values.name || "",
        watchlistName, // from props
        purchasePrice: values.purchasePrice,
      });

      if (response.success) {
        toast({ description: response.message });
        onStockAdded?.(); // optional callback
      } else {
        toast({ variant: "destructive", description: response.message });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Ex. AAPL"
        value={symbolSearchTerm}
        onChange={(e) => setSymbolSearchTerm(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button onClick={handleSearchSymbol}>Search</Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]" align="end">
          {stockData?.length ? (
            stockData.map((stock, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex flex-col mb-2">
                  <span className="font-bold text-sm">{stock.symbol}</span>
                  <span className="text-sm">{stock.name}</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => handleSelectStock(stock)}
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

                    {/* shadcn/ui Form example */}
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="symbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Symbol</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Symbol"
                                  {...field}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Hidden field for name if needed */}
                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Price (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Purchase Price"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button type="submit">Confirm</Button>
                          <DialogClose asChild>
                            <Button variant="secondary">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            ))
          ) : (
            <p>No stocks found</p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
