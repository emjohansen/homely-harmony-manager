import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomStoreDialogProps {
  onStoreAdded: (store: string) => void;
}

export const CustomStoreDialog = ({ onStoreAdded }: CustomStoreDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newStore, setNewStore] = useState("");
  const { toast } = useToast();

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;

    try {
      // Get current user's household
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add custom stores",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (!profile?.current_household) {
        toast({
          title: "Error",
          description: "No household selected",
          variant: "destructive",
        });
        return;
      }

      // Get current custom stores
      const { data: household } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', profile.current_household)
        .single();

      const currentStores = household?.custom_stores || [];
      
      // Update household with new store
      const { error } = await supabase
        .from('households')
        .update({ 
          custom_stores: [...currentStores, newStore.trim()] 
        })
        .eq('id', profile.current_household);

      if (error) {
        console.error('Error adding custom store:', error);
        toast({
          title: "Error",
          description: "Failed to add custom store",
          variant: "destructive",
        });
        return;
      }

      onStoreAdded(newStore.trim());
      setNewStore("");
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="ghost" 
          className="w-full justify-start text-left px-2 py-1.5 text-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
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
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
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