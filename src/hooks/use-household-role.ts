import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export const useHouseholdRole = (householdId: string | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkRole = async () => {
      if (!householdId || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: household, error } = await supabase
          .from('households')
          .select('admins')
          .eq('id', householdId)
          .single();

        if (error) throw error;

        setIsAdmin(household?.admins?.includes(user.id) || false);
      } catch (error) {
        console.error('Error checking role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [householdId, user]);

  return { isAdmin, isLoading };
};