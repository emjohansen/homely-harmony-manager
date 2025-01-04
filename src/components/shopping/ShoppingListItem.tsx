import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ShoppingListItemProps {
  item: {
    id: string;
    item: string;
    quantity?: number;
    unit?: string;
    is_checked: boolean;
    store?: string;
    price?: number;
    added_by?: string;
    added_at: string;
  };
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateStore: (id: string, store: string) => void;
}

const STORES = [
  "REMA 1000",
  "COOP",
  "KIWI",
  "SPAR",
  "EUROPRIS",
  "unspecified"
];

export const ShoppingListItem = ({
  item,
  onToggle,
  onDelete,
  onUpdatePrice,
  onUpdateStore,
}: ShoppingListItemProps) => {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [price, setPrice] = useState(item.price?.toString() || "");

  const handlePriceSubmit = () => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice)) {
      onUpdatePrice(item.id, numericPrice);
    }
    setShowPriceInput(false);
  };

  return (
    <div className="flex items-center gap-4 p-2 bg-background rounded-lg border">
      <Checkbox
        checked={item.is_checked}
        onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={item.is_checked ? "line-through text-gray-500" : ""}>
            {item.item}
          </span>
          {item.quantity && (
            <span className="text-sm text-gray-500">
              ({item.quantity} {item.unit})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Added by {item.added_by} {formatDistanceToNow(new Date(item.added_at))} ago</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={item.store || "unspecified"}
          onValueChange={(value) => onUpdateStore(item.id, value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STORES.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showPriceInput ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20"
              placeholder="Price"
            />
            <Button size="sm" onClick={handlePriceSubmit}>
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPriceInput(true)}
          >
            {item.price ? (
              <span className="text-sm">{item.price} kr</span>
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(item.id)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};