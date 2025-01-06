import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomStoreDialog } from "./CustomStoreDialog";

interface AddShoppingListItemProps {
  onAddItem: (item: string, quantity: string, store: string) => void;
}

const DEFAULT_STORES = ["Any Store"];

export const AddShoppingListItem = ({ onAddItem }: AddShoppingListItemProps) => {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newStore, setNewStore] = useState("Any Store");
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [allStores, setAllStores] = useState<string[]>(DEFAULT_STORES);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomStores();
  }, []);

  const fetchCustomStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (profile?.current_household) {
        const { data: household } = await supabase
          .from('households')
          .select('custom_stores')
          .eq('id', profile.current_household)
          .single();

        const userCustomStores = household?.custom_stores || [];
        setCustomStores(userCustomStores);
        setAllStores([...DEFAULT_STORES, ...userCustomStores]);
      }
    } catch (error) {
      console.error('Error fetching custom stores:', error);
      toast({
        title: "Error",
        description: "Failed to load custom stores",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    onAddItem(newItem, newQuantity, newStore);
    setNewItem("");
    setNewQuantity("");
    setNewStore("Any Store");
  };

  const handleStoreAdded = (store: string) => {
    setCustomStores(prev => [...prev, store]);
    setAllStores(prev => [...prev, store]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 bg-[#efffed]">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add new item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 border-sage border"
        />
        <Input
          type="number"
          placeholder="Qty"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-16 border-sage border"
        />
        <Select value={newStore} onValueChange={setNewStore}>
          <SelectTrigger className="w-32 border-sage border">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent className="bg-[#efffed] z-50">
            {allStores.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
            <CustomStoreDialog onStoreAdded={handleStoreAdded} />
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-sage hover:bg-sage/90">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};