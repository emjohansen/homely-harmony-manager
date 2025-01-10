import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  username?: string;
}

export const useHouseholdMembers = (householdId: string | null) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!householdId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching household data:', householdId);
      
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('members')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      if (household?.members) {
        // Fetch usernames for all members
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', household.members);

        if (profilesError) throw profilesError;

        setMembers(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch household members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!householdId) return;

    try {
      // First get current members array
      const { data: household, error: fetchError } = await supabase
        .from('households')
        .select('members, admins')
        .eq('id', householdId)
        .single();

      if (fetchError) throw fetchError;

      // Remove member from both arrays
      const updatedMembers = (household.members || []).filter(id => id !== memberId);
      const updatedAdmins = (household.admins || []).filter(id => id !== memberId);

      // Update the household
      const { error: updateError } = await supabase
        .from('households')
        .update({
          members: updatedMembers,
          admins: updatedAdmins
        })
        .eq('id', householdId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  return { members, isLoading, fetchMembers, removeMember };
};