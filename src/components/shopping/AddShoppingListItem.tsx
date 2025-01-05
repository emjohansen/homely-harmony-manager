import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddShoppingListItemProps {
  onAddItem: (item: string, quantity: string, store: string) => void;
}

const STORES = [
  "REMA 1000",
  "COOP",
  "KIWI",
  "SPAR",
  "EUROPRIS",
  "unspecified"
];

export const AddShoppingListItem = ({ onAddItem }: AddShoppingListItemProps) => {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newStore, setNewStore] = useState("unspecified");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    onAddItem(newItem, newQuantity, newStore);
    setNewItem("");
    setNewQuantity("");
    setNewStore("unspecified");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6 bg-[#efffed] relative">
      <Badge 
        variant="outline" 
        className="absolute top-2 right-2 bg-[#efffed]"
      >
        {newStore}
      </Badge>
      <div className="flex items-center gap-2 !p-0">
        <Input
          placeholder="Add new item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Qty"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-16"
        />
      </div>
      <Button type="submit" className="w-full bg-sage hover:bg-sage/90">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};