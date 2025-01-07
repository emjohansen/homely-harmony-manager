import { useState, useEffect } from 'react';
import { members } from '@/services/storage/members';
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
        const householdMembers = await members.getByHousehold(householdId);
        const userMember = householdMembers.find(m => m.user_id === user.id);
        setIsAdmin(userMember?.role === 'admin');
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