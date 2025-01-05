import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-2 p-3 bg-background rounded-lg border">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.is_checked}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
          className="mt-1 bg-mint border border-sage data-[state=checked]:bg-sage data-[state=unchecked]:bg-mint"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`${item.is_checked ? "line-through text-gray-500" : ""} break-words`}>
              {item.item}
            </span>
            {item.quantity && (
              <span className="text-sm text-gray-500 shrink-0">
                ({item.quantity})
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Added {formatDistanceToNow(new Date(item.added_at))} ago
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Select
          value={item.store || "unspecified"}
          onValueChange={(value) => onUpdateStore(item.id, value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-cream">
            {STORES.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPriceInput(true)}
          className="shrink-0"
        >
          {item.price ? (
            <span className="text-sm">{item.price} kr</span>
          ) : (
            <DollarSign className="h-4 w-4" />
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] bg-cream">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-cream">Cancel</AlertDialogCancel>
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