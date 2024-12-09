"use client";

import { removeStock } from "@/app/actions/actions";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

const DelStockBtn = ({ stockId }: { stockId: string }) => {
  const { toast } = useToast();

  const handleRemoveStock = async () => {
    try {
      const response = await removeStock(stockId);
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
  };
  return (
    <Button type="button" variant="destructive" onClick={handleRemoveStock}>
      Delete
    </Button>
  );
};

export default DelStockBtn;
