import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6 bg-[#efffed] p-4 rounded-lg">
      <div className="flex gap-2">
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
      <div className="flex gap-2">
        <Select value={newStore} onValueChange={setNewStore}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent className="bg-[#efffed]">
            {STORES.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-16">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};