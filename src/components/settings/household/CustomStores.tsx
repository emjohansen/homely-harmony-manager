import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CustomStores = () => {
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [newStore, setNewStore] = useState("");
  const { toast } = useToast();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentHousehold();
  }, []);

  const fetchCurrentHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

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
        console.log('Current household ID:', profile.current_household);
        setCurrentHouseholdId(profile.current_household);
        fetchCustomStores(profile.current_household);
      }
    } catch (error) {
      console.error('Error in fetchCurrentHousehold:', error);
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

      console.log('Fetched custom stores:', data?.custom_stores);
      setCustomStores(data?.custom_stores || []);
    } catch (error) {
      console.error('Error in fetchCustomStores:', error);
    }
  };

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim() || !currentHouseholdId) {
      console.log('No store name or household ID');
      return;
    }

    try {
      console.log('Adding custom store:', newStore, 'to household:', currentHouseholdId);
      const updatedStores = [...customStores, newStore.trim()];
      
      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (error) {
        console.error('Error adding custom store:', error);
        toast({
          title: "Error",
          description: "Failed to add custom store: " + error.message,
          variant: "destructive",
        });
        return;
      }

      setCustomStores(updatedStores);
      setNewStore("");
      toast({
        title: "Success",
        description: "Custom store added successfully",
      });
    } catch (error) {
      console.error('Error in addCustomStore:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const removeCustomStore = async (storeToRemove: string) => {
    if (!currentHouseholdId) return;

    try {
      const updatedStores = customStores.filter(store => store !== storeToRemove);
      
      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (error) {
        console.error('Error removing custom store:', error);
        toast({
          title: "Error",
          description: "Failed to remove custom store",
          variant: "destructive",
        });
        return;
      }

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Custom store removed successfully",
      });
    } catch (error) {
      console.error('Error in removeCustomStore:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="stores" className="border-[#9dbc98]">
        <AccordionTrigger>
          Custom Stores ({customStores.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <form onSubmit={addCustomStore} className="flex gap-2">
              <Input
                placeholder="Add new store..."
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-sage hover:bg-sage/90">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="space-y-2">
              {customStores.map((store) => (
                <div key={store} className="flex items-center justify-between p-2 bg-mint rounded-lg">
                  <span>{store}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomStore(store)}
                    className="text-forest hover:text-forest/70"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};