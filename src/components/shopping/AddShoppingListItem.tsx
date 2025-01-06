import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StoreSelect } from "./store/StoreSelect";
import { CustomStoreDialog } from "./store/CustomStoreDialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentHousehold();
  }, []);

  const fetchCurrentHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching current household:', profileError);
        return;
      }

      if (profile?.current_household) {
        setCurrentHouseholdId(profile.current_household);
        fetchCustomStores(profile.current_household);
      }
    } catch (error) {
      console.error('Error fetching current household:', error);
      toast({
        title: "Error",
        description: "Failed to load custom stores",
        variant: "destructive",
      });
    }
  };

  const fetchCustomStores = async (householdId: string) => {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', householdId)
        .single();

      if (error) {
        console.error('Error fetching custom stores:', error);
        return;
      }

      const userCustomStores = data?.custom_stores || [];
      setCustomStores(userCustomStores);
      setAllStores([...DEFAULT_STORES, ...userCustomStores]);
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
    setNewStore(store);
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
        <StoreSelect
          value={newStore}
          onValueChange={setNewStore}
          stores={allStores}
          onAddStoreClick={() => setIsDialogOpen(true)}
        />
      </div>
      <Button type="submit" className="w-full bg-sage hover:bg-sage/90">
        <Plus className="h-4 w-4" />
      </Button>

      {currentHouseholdId && (
        <CustomStoreDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onStoreAdded={handleStoreAdded}
          currentHouseholdId={currentHouseholdId}
          customStores={customStores}
        />
      )}
    </form>
  );
};