import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Invite {
  id: string;
  household_id: string;
  households: {
    name: string;
  };
  status: string;
  invited_by: string;
  profiles: {
    username: string;
  } | null;
}

export const useInvites = () => {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Fetching invites for user email:', user.email);

      // First fetch the invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('household_invites')
        .select(`
          id,
          household_id,
          households:household_id (
            name
          ),
          status,
          invited_by
        `)
        .eq('email', user.email)
        .eq('status', 'pending');

      if (invitesError) throw invitesError;

      if (invitesData) {
        // Then fetch the profiles for the inviters
        const inviterIds = invitesData.map(invite => invite.invited_by).filter(Boolean);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', inviterIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const invitesWithProfiles = invitesData.map(invite => ({
          ...invite,
          profiles: profilesData?.find(p => p.id === invite.invited_by) || null
        }));

        console.log('Fetched invites with profiles:', invitesWithProfiles);
        setPendingInvites(invitesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string, householdId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log('Accepting invite:', inviteId, 'for household:', householdId);

      // First check if user is already a member of this household
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError;
      }

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this household",
          variant: "default",
        });
        return;
      }

      // Add user to household members first
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdId,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        console.error('Error adding member:', memberError);
        throw memberError;
      }

      // Then update invite status
      const { error: updateError } = await supabase
        .from('household_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId)
        .eq('status', 'pending');

      if (updateError) {
        // If updating invite fails, try to remove the member
        await supabase
          .from('household_members')
          .delete()
          .eq('household_id', householdId)
          .eq('user_id', user.id);
        throw updateError;
      }

      // Remove the accepted invite from the local state
      setPendingInvites(prevInvites => 
        prevInvites.filter(invite => invite.id !== inviteId)
      );

      toast({
        title: "Success",
        description: "Invitation accepted successfully",
      });

      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const handleDenyInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('household_invites')
        .update({ status: 'denied' })
        .eq('id', inviteId)
        .eq('status', 'pending');

      if (error) throw error;

      // Remove the denied invite from the local state
      setPendingInvites(prevInvites => 
        prevInvites.filter(invite => invite.id !== inviteId)
      );

      toast({
        title: "Success",
        description: "Invitation denied successfully",
      });
    } catch (error: any) {
      console.error('Error denying invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deny invitation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return {
    pendingInvites,
    isLoading,
    handleAcceptInvite,
    handleDenyInvite
  };
};