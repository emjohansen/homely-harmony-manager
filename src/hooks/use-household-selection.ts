import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRetry } from "@/hooks/use-retry";

interface Household {
  id: string;
  name: string;
}

export const useHouseholdSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry } = useRetry();

  const selectHousehold = async (household: Household) => {
    try {
      setIsLoading(true);
      console.log("Selecting household:", household);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found");
      }

      // First update the local state
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: `Switched to ${household.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating active household:', error);
      toast({
        title: "Error",
        description: "Failed to switch household. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectHousehold,
    isLoading
  };
};