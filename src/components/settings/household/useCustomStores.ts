import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomStores = () => {
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

      if (profileError) throw profileError;

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

      if (error) throw error;

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

  const addCustomStore = async (newStore: string) => {
    if (!newStore.trim() || !currentHouseholdId || isLoading) return;

    setIsLoading(true);
    try {
      const trimmedStore = newStore.trim();
      console.log('Adding custom store:', trimmedStore, 'to household:', currentHouseholdId);
      
      const { data, error } = await supabase
        .from('households')
        .update({ 
          custom_stores: [...customStores, trimmedStore]
        })
        .eq('id', currentHouseholdId)
        .select('custom_stores')
        .single();

      if (error) throw error;

      console.log('Updated stores:', data.custom_stores);
      setCustomStores(data.custom_stores);
      toast({
        title: "Success",
        description: "Custom store added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding custom store:', error);
      toast({
        title: "Error",
        description: "Failed to add custom store",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomStore = async (storeToRemove: string) => {
    if (!currentHouseholdId || isLoading) return;

    setIsLoading(true);
    try {
      const updatedStores = customStores.filter(store => store !== storeToRemove);
      
      const { data, error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId)
        .select('custom_stores')
        .single();

      if (error) throw error;

      setCustomStores(data.custom_stores);
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

  return {
    customStores,
    isLoading,
    addCustomStore,
    removeCustomStore
  };
};