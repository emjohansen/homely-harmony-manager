import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      // Get existing stores or initialize empty array
      const { data: household } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', currentHousehold.id)
        .single();

      // Create new array with all existing stores plus the new one
      const existingStores = household?.custom_stores || [];
      const updatedStores = [...existingStores, newStore.trim()];
      
      console.log('Current stores:', existingStores);
      console.log('Adding new store. Updated array:', updatedStores);

      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHousehold.id);

      if (error) throw error;

      toast.success("Store added successfully");
      setNewStore("");
      onHouseholdsChange();
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error("Failed to add store");
    }
  };

  const handleRemoveStore = async (storeToRemove: string) => {
    if (!currentHousehold) return;

    try {
      // Get current stores
      const { data: household } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', currentHousehold.id)
        .single();

      const currentStores = household?.custom_stores || [];
      const updatedStores = currentStores.filter(store => store !== storeToRemove);
      
      console.log('Current stores:', currentStores);
      console.log('Removing store. Updated array:', updatedStores);

      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHousehold.id);

      if (error) throw error;

      toast.success("Store removed successfully");
      onHouseholdsChange();
    } catch (error) {
      console.error('Error removing store:', error);
      toast.error("Failed to remove store");
    }
  };

  // Debug log to check what stores we have
  console.log('Current household stores:', currentHousehold?.custom_stores);

  return (
    <div className="p-6 bg-[#efffed] rounded shadow">
      <h2 className="text-lg font-bold mb-4">Custom Stores Management</h2>
      
      {/* Add store form */}
      <form onSubmit={handleAddStore} className="space-y-4 mb-4">
        <div className="flex gap-2">
          <Input
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
            placeholder="Add new store..."
            className="flex-1"
          />
          <Button type="submit" className="bg-sage hover:bg-sage/90 text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* List of stores in accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="stores">
          <AccordionTrigger className="text-forest">
            Stored Stores ({currentHousehold?.custom_stores?.length || 0})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {currentHousehold?.custom_stores && currentHousehold.custom_stores.length > 0 ? (
                currentHousehold.custom_stores.map((store) => (
                  <div 
                    key={store} 
                    className="flex items-center justify-between p-2 bg-mint rounded"
                  >
                    <span className="text-forest">{store}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStore(store)}
                      className="text-forest hover:text-forest/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-forest/70 text-sm italic">No stores added yet</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};