"use client";

import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";

import { addStockToWatchlist } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";

// shadcn/ui
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SymbolValidationResult {
  symbol: string;
  name: string;
  purchasePrice?: number;
}

// We create a separate schema for the dynamic array of stocks
const manyStocksSchema = z.object({
  stocks: z.array(
    z.object({
      symbol: z.string().min(1, "Symbol is required"),
      name: z.string().optional(),
      purchasePrice: z
        .number({ invalid_type_error: "Purchase Price must be a number" })
        .positive("Must be positive")
        .optional(),
    })
  ),
});

type ManyStocksFormValues = z.infer<typeof manyStocksSchema>;

interface AddManyStocksProps {
  watchlistName: string; // passed from parent
  onStocksAdded?: () => void; // callback
}

export function AddManyStocks({
  watchlistName,
  onStocksAdded,
}: AddManyStocksProps) {
  const { toast } = useToast();

  const [rawInput, setRawInput] = useState("");
  const form = useForm<ManyStocksFormValues>({
    resolver: zodResolver(manyStocksSchema),
    defaultValues: {
      stocks: [],
    },
  });

  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stocks",
  });

  // 1. Validate symbols from textarea
  //    This example expects user to paste e.g. "AAPL 150\nMSFT 200" or something similar
  const handleValidate = async () => {
    // Adjust this logic to your use case
    // For example, assume each line is "Symbol optionalPurchasePrice"
    // e.g. "AAPL 150" or just "AAPL"
    const lines = rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const validatedResults: SymbolValidationResult[] = [];

    for (const line of lines) {
      // Split on spaces, handle symbol / purchasePrice
      const parts = line.split(/\s+/);
      const symbol = parts[0].toUpperCase();
      const purchasePrice = parts[1] ? parseFloat(parts[1]) : undefined;

      // Call an API to get the name (or fake it)
      let name = "";
      try {
        const resp = await axios.get(
          `https://marketplace.financialmodelingprep.com/public/search?query=${symbol}`
        );
        const { stock } = resp.data;
        // naive approach, just take the first result
        name = stock?.[0]?.name ?? "";
      } catch (error) {
        console.error("Error fetching symbol name:", error);
      }

      validatedResults.push({ symbol, name, purchasePrice });
    }

    // set our form fields with validated results
    reset({
      stocks: validatedResults.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        purchasePrice: item.purchasePrice,
      })),
    });
  };

  // 2. Submit the final form of stocks
  const onSubmit: SubmitHandler<ManyStocksFormValues> = async (values) => {
    try {
      // Example: loop through each stock to add it to watchlist
      for (const s of values.stocks) {
        const response = await addStockToWatchlist({
          symbol: s.symbol.toUpperCase(),
          stockName: s.name || "",
          watchlistName,
          purchasePrice: s.purchasePrice,
        });

        if (!response.success) {
          toast({ variant: "destructive", description: response.message });
          return;
        }
      }

      toast({ description: "All stocks added successfully" });
      onStocksAdded?.();

      // Clear everything
      setRawInput("");
      reset({ stocks: [] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Many Stocks</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add many stocks</DialogTitle>
          <DialogDescription>
            Paste multiple symbols (optionally with purchase price), validate,
            then add them to your watchlist.
          </DialogDescription>
        </DialogHeader>

        <div className=" space-y-4 ">
          <Label>Symbols / Purchase Prices (one per line)</Label>
          <Textarea
            placeholder={`e.g.\nAAPL 150\nMSFT 220\nTSLA 250`}
            value={rawInput}
            rows={10}
            onChange={(e) => setRawInput(e.target.value)}
          />

          <Button onClick={handleValidate}>Validate</Button>

          {/* Once validated, it populates the form fields below */}
          {fields.length > 0 && (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-2 border rounded-md space-y-2 mb-3"
                  >
                    <FormField
                      control={control}
                      name={`stocks.${index}.symbol`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="Symbol" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`stocks.${index}.purchasePrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price</FormLabel>
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

                    <Button variant="destructive" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <DialogFooter>
                  <Button type="submit">Add All</Button>
                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
