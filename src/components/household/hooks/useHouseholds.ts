import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useHouseholds = (userId: string | undefined) => {
  const { toast } = useToast();
  const [households, setHouseholds] = useState<any[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHouseholds = async (uid: string) => {
    try {
      console.log('Fetching households for user:', uid);
      const { data: memberships, error } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          households (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', uid);

      if (error) {
        console.error('Error fetching households:', error);
        throw error;
      }

      console.log('Fetched memberships:', memberships);

      if (!Array.isArray(memberships)) {
        console.log('No memberships found or invalid data');
        setHouseholds([]);
        return;
      }

      const formattedHouseholds = memberships.map(membership => ({
        id: membership.households.id,
        name: membership.households.name,
        role: membership.role,
        isCreator: membership.households.created_by === uid
      }));

      console.log('Formatted households:', formattedHouseholds);
      setHouseholds(formattedHouseholds);

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', uid)
        .single();

      console.log('Current household from profile:', profile?.current_household);
      
      if (profile?.current_household && formattedHouseholds.some(h => h.id === profile.current_household)) {
        const currentHouse = formattedHouseholds.find(h => h.id === profile.current_household);
        console.log('Setting current household from profile:', currentHouse);
        setCurrentHousehold(currentHouse);
      } else if (formattedHouseholds.length > 0) {
        console.log('Setting first household as current:', formattedHouseholds[0]);
        setCurrentHousehold(formattedHouseholds[0]);
        await supabase
          .from('profiles')
          .update({ 
            current_household: formattedHouseholds[0].id,
            updated_at: new Date().toISOString()
          })
          .eq('id', uid);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch households",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHouseholds(userId);
    }
  }, [userId]);

  return {
    households,
    currentHousehold,
    loading,
    fetchHouseholds,
    setCurrentHousehold
  };
};