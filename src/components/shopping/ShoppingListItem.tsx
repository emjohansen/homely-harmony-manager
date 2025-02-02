import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Trash2, DollarSign, User } from "lucide-react";

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

export const ShoppingListItem = ({
  item,
  onToggle,
  onDelete,
  onUpdatePrice,
}: ShoppingListItemProps) => {
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [price, setPrice] = useState(item.price?.toString() || "");

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      console.log('Updating item check state:', { itemId: item.id, checked });
      
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: checked })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating item:', error);
        toast.error("Failed to update item");
        return;
      }

      onToggle(item.id, checked);
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handlePriceSubmit = () => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice)) {
      onUpdatePrice(item.id, numericPrice);
    }
    setShowPriceInput(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border relative ${item.is_checked ? 'bg-mint' : 'bg-background'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.is_checked}
          onCheckedChange={handleCheckboxChange}
          className="mt-1 bg-mint border border-sage data-[state=checked]:bg-sage data-[state=unchecked]:bg-mint"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <span className={`${item.is_checked ? "line-through text-gray-500" : ""} break-words`}>
                {truncateText(item.item, 15)}
              </span>
              {item.quantity && (
                <span className="text-sm text-gray-500 ml-2">
                  ({item.quantity})
                </span>
              )}
            </div>
            {item.store && item.store !== 'unspecified' && (
              <Badge 
                variant="secondary" 
                className="bg-[#9dbc98] text-white hover:bg-[#9dbc98]/90"
              >
                {item.store}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-0 -ml-[25px]">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="h-[15px] w-[15px]" />
                <span>{item.added_by}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 pl-[22px]">
                {formatDate(new Date(item.added_at))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showPriceInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-24 h-8"
                    placeholder="Price"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePriceSubmit();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePriceSubmit}
                    className="h-8 bg-[#9dbc98] text-white hover:bg-[#9dbc98]/90 shrink-0"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPriceInput(true)}
                  className="shrink-0 bg-[#9dbc98] text-white hover:bg-[#9dbc98]/90"
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
                  <Button variant="ghost" size="sm" className="text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] bg-[#efffed]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this item? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[#efffed]">Cancel</AlertDialogCancel>
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
        </div>
      </div>
    </div>
  );
};