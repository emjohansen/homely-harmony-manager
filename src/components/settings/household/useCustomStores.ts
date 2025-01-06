import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRetry } from "@/hooks/use-retry";

export const useCustomStores = () => {
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetry();

  useEffect(() => {
    fetchCustomStores();
  }, []);

  const fetchCustomStores = async () => {
    try {
      console.log('Fetching custom stores...');
      const { data: { user } } = await executeWithRetry(() => 
        supabase.auth.getUser()
      );
      
      if (!user) {
        console.log('No user found');
        return;
      }

      const { data: profile } = await executeWithRetry(() =>
        supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single()
      );

      if (!profile?.current_household) {
        console.log('No current household found');
        return;
      }

      console.log('Fetching household data for:', profile.current_household);
      const { data: household, error } = await executeWithRetry(() =>
        supabase
          .from('households')
          .select('custom_stores')
          .eq('id', profile.current_household)
          .single()
      );

      if (error) throw error;

      console.log('Fetched custom stores:', household?.custom_stores);
      setCustomStores(household?.custom_stores || []);
    } catch (error) {
      console.error('Error in fetchCustomStores:', error);
      toast({
        title: "Error",
        description: "Failed to load custom stores. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const addCustomStore = async (newStore: string) => {
    try {
      setIsLoading(true);
      console.log('Adding new store:', newStore);
      
      const { data: { user } } = await executeWithRetry(() =>
        supabase.auth.getUser()
      );
      
      if (!user) {
        console.log('No user found');
        return false;
      }

      const { data: profile } = await executeWithRetry(() =>
        supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single()
      );

      if (!profile?.current_household) {
        console.log('No current household found');
        toast({
          title: "Error",
          description: "No household selected",
          variant: "destructive",
        });
        return false;
      }

      const trimmedStore = newStore.trim();
      if (customStores.includes(trimmedStore)) {
        toast({
          title: "Error",
          description: "This store already exists",
          variant: "destructive",
        });
        return false;
      }

      const updatedStores = [...customStores, trimmedStore];
      console.log('Updating stores to:', updatedStores);
      
      const { error } = await executeWithRetry(() =>
        supabase
          .from('households')
          .update({ custom_stores: updatedStores })
          .eq('id', profile.current_household)
      );

      if (error) throw error;

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Store added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error in addCustomStore:', error);
      toast({
        title: "Error",
        description: "Failed to add store. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomStore = async (storeToRemove: string) => {
    try {
      setIsLoading(true);
      console.log('Removing store:', storeToRemove);
      
      const { data: { user } } = await executeWithRetry(() =>
        supabase.auth.getUser()
      );
      
      if (!user) {
        console.log('No user found');
        return;
      }

      const { data: profile } = await executeWithRetry(() =>
        supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single()
      );

      if (!profile?.current_household) {
        console.log('No current household found');
        return;
      }

      const updatedStores = customStores.filter(store => store !== storeToRemove);
      console.log('Updating stores to:', updatedStores);
      
      const { error } = await executeWithRetry(() =>
        supabase
          .from('households')
          .update({ custom_stores: updatedStores })
          .eq('id', profile.current_household)
      );

      if (error) throw error;

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Store removed successfully",
      });
    } catch (error) {
      console.error('Error in removeCustomStore:', error);
      toast({
        title: "Error",
        description: "Failed to remove store. Please try again.",
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