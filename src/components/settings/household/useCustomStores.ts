import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomStores = () => {
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomStores();
  }, []);

  const fetchCustomStores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.current_household) {
        const { data: household, error } = await supabase
          .from('households')
          .select('custom_stores')
          .eq('id', profile.current_household)
          .maybeSingle();

        if (error) throw error;
        setCustomStores(household?.custom_stores || []);
      }
    } catch (error) {
      console.error('Error fetching custom stores:', error);
      toast({
        title: "Error",
        description: "Failed to load custom stores",
        variant: "destructive",
      });
    }
  };

  const addCustomStore = async (newStore: string) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.current_household) return false;

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
      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', profile.current_household);

      if (error) throw error;

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Store added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding custom store:', error);
      toast({
        title: "Error",
        description: "Failed to add store",
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.current_household) return;

      const updatedStores = customStores.filter(store => store !== storeToRemove);
      const { error } = await supabase
        .from('households')
        .update({ custom_stores: updatedStores })
        .eq('id', profile.current_household);

      if (error) throw error;

      setCustomStores(updatedStores);
      toast({
        title: "Success",
        description: "Store removed successfully",
      });
    } catch (error) {
      console.error('Error removing custom store:', error);
      toast({
        title: "Error",
        description: "Failed to remove store",
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