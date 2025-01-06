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
  const [isLoading, setIsLoading] = useState(false);

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
        setCurrentHouseholdId(profile.current_household);
        await fetchCustomStores(profile.current_household);
      }
    } catch (error) {
      console.error('Error in fetchCurrentHousehold:', error);
      toast({
        title: "Error",
        description: "Failed to fetch household information",
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
        throw error;
      }

      console.log('Fetched custom stores:', data?.custom_stores);
      setCustomStores(data?.custom_stores || []);
    } catch (error) {
      console.error('Error fetching custom stores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom stores",
        variant: "destructive",
      });
    }
  };

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim() || !currentHouseholdId || isLoading) return;

    setIsLoading(true);
    try {
      const trimmedStore = newStore.trim();
      console.log('Adding custom store:', trimmedStore, 'to household:', currentHouseholdId);
      
      // First get the current stores to ensure we have the latest data
      const { data: currentData, error: fetchError } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', currentHouseholdId)
        .single();

      if (fetchError) throw fetchError;

      const currentStores = currentData?.custom_stores || [];
      const updatedStores = [...new Set([...currentStores, trimmedStore])];
      
      const { error: updateError } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (updateError) throw updateError;

      setCustomStores(updatedStores);
      setNewStore("");
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
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomStore = async (storeToRemove: string) => {
    if (!currentHouseholdId || isLoading) return;

    setIsLoading(true);
    try {
      const updatedStores = customStores.filter(store => store !== storeToRemove);
      
      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (error) throw error;

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Custom store removed successfully",
      });
    } catch (error) {
      console.error('Error removing custom store:', error);
      toast({
        title: "Error",
        description: "Failed to remove custom store",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="bg-sage hover:bg-sage/90"
                disabled={isLoading}
              >
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
                    disabled={isLoading}
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