import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@/types/household";

export const useHouseholdMembersManagement = (householdId: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      console.log('Fetching members for household:', householdId);
      
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('members, admins')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      if (household) {
        const allMemberIds = [...new Set([...(household.members || []), ...(household.admins || [])])];
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', allMemberIds);

        if (profilesError) throw profilesError;

        const membersList: Member[] = profiles?.map(profile => ({
          id: profile.id,
          household_id: householdId,
          user_id: profile.id,
          username: profile.username || 'Unknown User',
          role: household.admins?.includes(profile.id) ? 'admin' : 'member',
          created_at: new Date().toISOString() // Fallback since we don't have the actual creation date
        })) || [];

        console.log('Fetched members:', membersList);
        setMembers(membersList);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch household members",
        variant: "destructive",
      });
    }
  };

  const inviteMember = async (email: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .single();

      if (profileError) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('members')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      const updatedMembers = [...(household.members || [])];
      if (!updatedMembers.includes(profile.id)) {
        updatedMembers.push(profile.id);
      }

      const { error: updateError } = await supabase
        .from('households')
        .update({ members: updatedMembers })
        .eq('id', householdId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Member invited successfully",
      });
      
      await fetchMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('members, admins')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      const updatedMembers = (household.members || []).filter(id => id !== memberId);
      const updatedAdmins = (household.admins || []).filter(id => id !== memberId);

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

  return {
    members,
    inviteMember,
    removeMember,
    fetchMembers
  };
};