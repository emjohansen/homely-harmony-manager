import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddShoppingListItemProps {
  onAddItem: (item: string, quantity: string, unit: string) => void;
}

export const AddShoppingListItem = ({ onAddItem }: AddShoppingListItemProps) => {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    onAddItem(newItem, newQuantity, newUnit);
    setNewItem("");
    setNewQuantity("");
    setNewUnit("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        placeholder="Add new item..."
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        placeholder="Quantity"
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        className="w-24"
      />
      <Input
        placeholder="Unit"
        value={newUnit}
        onChange={(e) => setNewUnit(e.target.value)}
        className="w-24"
      />
      <Button type="submit">
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </form>
  );
};