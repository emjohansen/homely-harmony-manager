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

      const { data, error } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id)
        .select()
        .single();

      console.log("Update response:", { data, error });

      if (error) {
        throw error;
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