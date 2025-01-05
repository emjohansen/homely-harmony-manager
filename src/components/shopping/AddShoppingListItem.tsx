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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddShoppingListItemProps {
  onAddItem: (item: string, quantity: string, store: string) => void;
}

const DEFAULT_STORES = ["Any Store"];

export const AddShoppingListItem = ({ onAddItem }: AddShoppingListItemProps) => {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newStore, setNewStore] = useState("Any Store");
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [allStores, setAllStores] = useState<string[]>(DEFAULT_STORES);
  const [newCustomStore, setNewCustomStore] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomStores();
  }, []);

  const fetchCustomStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('custom_stores')
        .eq('id', user.id)
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

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomStore.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedStores = [...customStores, newCustomStore.trim()];
      const { error } = await supabase
        .from('profiles')
        .update({ custom_stores: updatedStores })
        .eq('id', user.id);

      if (error) {
        console.error('Error adding custom store:', error);
        toast({
          title: "Error",
          description: "Failed to add custom store",
          variant: "destructive",
        });
        return;
      }

      setCustomStores(updatedStores);
      setAllStores([...DEFAULT_STORES, ...updatedStores]);
      setNewCustomStore("");
      toast({
        title: "Success",
        description: "Custom store added successfully",
      });
    } catch (error) {
      console.error('Error adding custom store:', error);
      toast({
        title: "Error",
        description: "Failed to add custom store",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    onAddItem(newItem, newQuantity, newStore);
    setNewItem("");
    setNewQuantity("1");
    setNewStore("Any Store");
  };

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
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full justify-start text-left px-2 py-1.5 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add store
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#efffed]">
                <DialogHeader>
                  <DialogTitle>Add Custom Store</DialogTitle>
                </DialogHeader>
                <form onSubmit={addCustomStore} className="flex gap-2">
                  <Input
                    placeholder="Store name..."
                    value={newCustomStore}
                    onChange={(e) => setNewCustomStore(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-[#9dbc98] hover:bg-[#9dbc98]/90">
                    Add
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-sage hover:bg-sage/90">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};