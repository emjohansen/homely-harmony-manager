import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomStoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded: (store: string) => void;
  currentHouseholdId: string;
  customStores: string[];
}

export const CustomStoreDialog = ({
  isOpen,
  onClose,
  onStoreAdded,
  currentHouseholdId,
  customStores,
}: CustomStoreDialogProps) => {
  const [newCustomStore, setNewCustomStore] = useState("");
  const { toast } = useToast();

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomStore.trim() || !currentHouseholdId) {
      toast({
        title: "Error",
        description: "Please enter a store name",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding custom store:', {
        householdId: currentHouseholdId,
        newStore: newCustomStore,
        existingStores: customStores
      });

      const updatedStores = [...customStores, newCustomStore.trim()];
      
      const { data, error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId)
        .select();

      if (error) {
        console.error('Error adding custom store:', error);
        toast({
          title: "Error",
          description: "Failed to add custom store",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully added custom store:', data);
      onStoreAdded(newCustomStore.trim());
      setNewCustomStore("");
      onClose();
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#efffed]">
        <DialogHeader>
          <DialogTitle>Add Custom Store</DialogTitle>
          <DialogDescription>
            Add a new store to your shopping list options.
          </DialogDescription>
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
  );
};