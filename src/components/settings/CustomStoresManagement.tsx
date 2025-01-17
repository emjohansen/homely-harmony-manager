import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomStoresManagementProps {
  currentHousehold: { id: string; name: string; custom_stores?: string[] } | null;
  onHouseholdsChange: () => void;
}

export const CustomStoresManagement = ({ 
  currentHousehold,
  onHouseholdsChange 
}: CustomStoresManagementProps) => {
  const [newStore, setNewStore] = useState("");

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHousehold || !newStore.trim()) return;

    try {
      console.log('Adding new store:', newStore);
      const currentStores = currentHousehold.custom_stores || [];
      
      if (currentStores.includes(newStore)) {
        toast.error("This store already exists");
        return;
      }

      const updatedStores = [...currentStores, newStore];
      console.log('Updated stores array:', updatedStores);

      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHousehold.id);

      if (error) {
        console.error('Error adding store:', error);
        toast.error("Failed to add store");
        return;
      }

      toast.success("Store added successfully");
      setNewStore("");
      onHouseholdsChange();
    } catch (error) {
      console.error('Error in handleAddStore:', error);
      toast.error("An error occurred");
    }
  };

  const handleRemoveStore = async (storeToRemove: string) => {
    if (!currentHousehold) return;

    try {
      console.log('Removing store:', storeToRemove);
      const currentStores = currentHousehold.custom_stores || [];
      const updatedStores = currentStores.filter(store => store !== storeToRemove);

      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHousehold.id);

      if (error) {
        console.error('Error removing store:', error);
        toast.error("Failed to remove store");
        return;
      }

      toast.success("Store removed successfully");
      onHouseholdsChange();
    } catch (error) {
      console.error('Error in handleRemoveStore:', error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="p-6 bg-[#efffed] rounded shadow">
      <h2 className="text-lg font-bold mb-4">Custom Stores Management</h2>
      
      <form onSubmit={handleAddStore} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
            placeholder="Add new store..."
            className="flex-1"
          />
          <Button type="submit" className="bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {currentHousehold?.custom_stores?.map((store) => (
          <div key={store} className="flex items-center justify-between p-2 bg-white rounded">
            <span>{store}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveStore(store)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};