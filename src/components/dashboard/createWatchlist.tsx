"use client";

import { createWatchlist } from "@/app/actions/actions";
import { useState } from "react";
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
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  

export function CreateWatchlist() {
  const [watchListType, setWatchListType] = useState("");

  const handleCreateWatchlist = async () => {
    await createWatchlist(watchListType);
  };

  return (

  <Dialog>
          <DialogTrigger asChild>
            <Button>Create Watchlist</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Watchlist</DialogTitle>
            </DialogHeader>
            <Input type="text" value={watchListType} onChange={(e) => setWatchListType(e.target.value)} placeholder="Watchlist Name" />
            
            <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            
            <Button type="button" onClick={() => handleCreateWatchlist()}>Create</Button>
          </DialogClose>
        </DialogFooter>
          </DialogContent>

        </Dialog>
  )
}
