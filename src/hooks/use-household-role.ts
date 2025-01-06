import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHouseholdRole = (householdId: string | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!householdId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: memberData, error } = await supabase
          .from('household_members')
          .select('role')
          .eq('household_id', householdId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(memberData?.role === 'admin');
      } catch (error) {
        console.error('Error checking role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [householdId]);

  return { isAdmin, isLoading };
};