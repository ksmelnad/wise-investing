"use client";

import {
  SortingState,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { moveStocksToWatchlist } from "@/app/actions/actions";
import { PopoverClose } from "@radix-ui/react-popover";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  watchlists: any;
}

interface Watchlist {
  id: string;
  name: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  watchlists,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    currency: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  // console.log("Data", data);
  const [isPending, startTransition] = useTransition();
  const [destinationWatchlistId, setDestinationWatchlistId] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // console.log(
  //   "Selected Rows",
  //   table.getFilteredSelectedRowModel().rows.map((row) => row.original)
  // );

  const handleMoveToWatchlist = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedStocks = selectedRows.map((row) => row.original);
    const stockIds = selectedStocks.map((stock: any) => stock.id);
    const destinationWatchlist = watchlists.find(
      (watchlist: Watchlist) => watchlist.id === destinationWatchlistId
    );

    if (!destinationWatchlist) {
      console.error("Destination watchlist not found");
      return;
    }

    startTransition(() => {
      moveStocksToWatchlist({
        stockIds,
        destinationWatchlistId,
      });
    });
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-1 text-sm text-muted-foreground mt-2">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
        {table.getSelectedRowModel().rows.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                // variant="outline"
                className="ml-2"
              >
                Move to Watchlist
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]">
              <div className="flex flex-col gap-y-4">
                <Label>Choose Watchlist</Label>
                <Select
                  value={destinationWatchlistId}
                  // defaultValue={watchlists[0]?.id}
                  onValueChange={(val) => setDestinationWatchlistId(val)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choose a watchlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchlists.map((watchlist: any) => (
                      <SelectItem key={watchlist.id} value={watchlist.id}>
                        {watchlist.name.charAt(0).toUpperCase() +
                          watchlist.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PopoverClose asChild>
                  <Button disabled={isPending} onClick={handleMoveToWatchlist}>
                    {isPending && <Loader2 className="animate-spin" />}
                    Move
                  </Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
