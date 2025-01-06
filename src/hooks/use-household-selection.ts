import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Household {
  id: string;
  name: string;
}

export const useHouseholdSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectHousehold = async (household: Household) => {
    try {
      setIsLoading(true);
      console.log("Selecting household:", household);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found");
      }

      console.log("Current authenticated user:", user.id);

      // First update the local state
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      console.log("Update response:", { data, error: updateError });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: `Switched to ${household.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating active household:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
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