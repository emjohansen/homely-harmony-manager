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
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
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
      console.log('Fetching custom stores for household:', householdId);
      const { data, error } = await supabase
        .from('households')
        .select('custom_stores')
        .eq('id', householdId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching custom stores:', error);
        throw error;
      }

      const stores = data?.custom_stores || [];
      console.log('Fetched custom stores:', stores);
      setCustomStores(stores);
    } catch (error) {
      console.error('Error in fetchCustomStores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom stores",
        variant: "destructive",
      });
    }
  };

  const addCustomStore = async (newStore: string) => {
    if (!newStore.trim() || !currentHouseholdId || isLoading) {
      return false;
    }

    setIsLoading(true);
    try {
      const trimmedStore = newStore.trim();
      
      // Check if store already exists
      if (customStores.includes(trimmedStore)) {
        toast({
          title: "Error",
          description: "This store already exists",
          variant: "destructive",
        });
        return false;
      }

      console.log('Adding custom store:', trimmedStore, 'to household:', currentHouseholdId);
      
      const updatedStores = [...customStores, trimmedStore];
      
      const { error: updateError } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (updateError) {
        console.error('Error updating custom stores:', updateError);
        throw updateError;
      }

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Custom store added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error in addCustomStore:', error);
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
    if (!currentHouseholdId || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Removing custom store:', storeToRemove, 'from household:', currentHouseholdId);
      
      const updatedStores = customStores.filter(store => store !== storeToRemove);
      
      const { error: updateError } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', currentHouseholdId);

      if (updateError) {
        console.error('Error removing custom store:', updateError);
        throw updateError;
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