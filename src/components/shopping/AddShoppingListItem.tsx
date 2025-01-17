import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface AddShoppingListItemProps {
  onAddItem: (item: string, quantity: string, store: string) => void;
  householdId?: string;
}

export const AddShoppingListItem = ({ onAddItem, householdId }: AddShoppingListItemProps) => {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newStore, setNewStore] = useState("Any Store");
  const [customStores, setCustomStores] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomStores = async () => {
      if (!householdId) return;

      try {
        const { data: household, error } = await supabase
          .from('households')
          .select('custom_stores')
          .eq('id', householdId)
          .single();

        if (error) {
          console.error('Error fetching custom stores:', error);
          return;
        }

        if (household?.custom_stores) {
          setCustomStores(household.custom_stores);
        }
      } catch (error) {
        console.error('Error in fetchCustomStores:', error);
      }
    };

    fetchCustomStores();
  }, [householdId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    onAddItem(newItem, newQuantity, newStore);
    setNewItem("");
    setNewQuantity("1");
    setNewStore("Any Store");
  };

  const handleAddStore = () => {
    navigate('/settings');
  };

  const allStores = ["Any Store", ...customStores];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6 bg-[#efffed]">
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
        <Select value={newStore} onValueChange={setNewStore}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent className="bg-[#efffed]">
            {allStores.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
            <Button
              type="button"
              onClick={handleAddStore}
              className="w-full mt-2 bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white"
            >
              Add Store
            </Button>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-[#9dbc98] hover:bg-[#9dbc98]/90">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};