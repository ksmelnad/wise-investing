"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Stock } from "@prisma/client";
import { currencySymbols } from "@/utils/currencySymbolMap";
import { JSX, useState } from "react";
import { removeStock } from "@/app/actions/actions";

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return (marketCap / 1e12).toFixed(2) + "T"; // Trillion
  } else if (marketCap >= 1e9) {
    return (marketCap / 1e9).toFixed(2) + "B"; // Billion
  } else if (marketCap >= 1e6) {
    return (marketCap / 1e6).toFixed(2) + "M"; // Million
  } else {
    return marketCap.toString();
  }
}

const DeleteDialog = (): JSX.Element => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete</DialogTitle>
        <DialogDescription>Are you sure you want to delete?</DialogDescription>
      </DialogHeader>
      Stock
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Delete
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

const EditDialog = (): JSX.Element => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit</DialogTitle>
        <DialogDescription>Are you sure you want to edit?</DialogDescription>
      </DialogHeader>
      Stock
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Done
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

// const handleDialogMenu = (): JSX.Element | null => {
//   switch (dialogMenu) {
//     case "edit":
//       return <EditDialog />
//     case "delete":
//       return <DeleteDialog />;
//     default:
//       return null;
//   }
// };

export const columns: ColumnDef<Stock>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ticker
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "marketCap",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-mr-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Market Cap
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rawValue = row.getValue("marketCap") as number | null;
      if (!rawValue) return <div className="text-right">N/A</div>;
      return <div className="text-right">{formatMarketCap(rawValue)}</div>;
    },
    // Sorting by numeric value
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null;
      const b = rowB.getValue(columnId) as number | null;
      // Coalesce to 0 for safe numeric comparison
      return (a ?? 0) - (b ?? 0);
    },
  },
  {
    accessorKey: "purchasePrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-mr-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Purchase Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchasePrice"));

      const currency = row.getValue("currency");
      if (!amount || !currency) {
        return <div className="text-right font-medium">N/A</div>;
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency as string,
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null;
      const b = rowB.getValue(columnId) as number | null;
      return (a ?? 0) - (b ?? 0);
    },
  },

  {
    accessorKey: "currentPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-mr-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Current Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("currentPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null;
      const b = rowB.getValue(columnId) as number | null;
      return (a ?? 0) - (b ?? 0);
    },
  },
  {
    accessorKey: "change",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-mr-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Change
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("change"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null;
      const b = rowB.getValue(columnId) as number | null;
      return (a ?? 0) - (b ?? 0);
    },
  },
  {
    accessorKey: "changePercent",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-mr-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Change %
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("changePercent"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as number | null;
      const b = rowB.getValue(columnId) as number | null;
      return (a ?? 0) - (b ?? 0);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original;

      // const handleRemoveStock = async () => {
      //   try {
      //     const res = await removeStock(stock.id);
      //     if (res.success) {

      //     }
      //   } catch (error) {

      //   }

      // };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}

            <DropdownMenuItem onClick={async () => await removeStock(stock.id)}>
              Delete
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
