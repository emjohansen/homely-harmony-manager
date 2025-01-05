import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInvitations = (onInviteAccepted?: () => void) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<any[]>([]);

  const fetchInvitations = async (userId: string) => {
    try {
      console.log('Fetching invitations...');
      const { data, error } = await supabase
        .from('household_invites')
        .select(`
          *,
          households:household_id (
            name,
            created_by
          ),
          inviter:invited_by (username)
        `)
        .or(`email.eq.${userId},invited_by.eq.${userId}`);

      if (error) throw error;

      console.log('Fetched invitations:', data);
      setInvitations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch invitations",
      });
    }
  };

  const handleAcceptInvite = async (inviteId: string, userId: string, households: any[]) => {
    try {
      // Check if user has reached the household limit
      if (households.length >= 3) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You can only be a member of up to 3 households",
        });
        return;
      }

      const { data: invite } = await supabase
        .from('household_invites')
        .select('household_id')
        .eq('id', inviteId)
        .single();

      if (!invite) return;

      // Add user to household members
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: invite.household_id,
          user_id: userId,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invite status
      const { error: updateError } = await supabase
        .from('household_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      // Update user's current household
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          current_household: invite.household_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "You have joined the household",
      });

      if (onInviteAccepted) {
        onInviteAccepted();
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not accept invitation",
      });
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('household_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation declined",
      });

      await fetchInvitations(inviteId);
    } catch (error) {
      console.error('Error declining invite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not decline invitation",
      });
    }
  };

  return {
    invitations,
    fetchInvitations,
    handleAcceptInvite,
    handleDeclineInvite
  };
};