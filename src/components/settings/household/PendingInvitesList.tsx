import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

interface PendingInvite {
  id: string;
  household_id: string;
  email: string;
  created_at: string;
  invited_by: string;
  household: {
    name: string;
  };
  inviter_email?: string;
}

interface PendingInvitesListProps {
  onInviteStatusChange: () => void;
}

export const PendingInvitesList = ({ onInviteStatusChange }: PendingInvitesListProps) => {
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const { toast } = useToast();

  const fetchPendingInvites = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.email) return;

      console.log('Fetching invites for email:', user.email);

      // First fetch the invites with household information
      const { data: invites, error } = await supabase
        .from('household_invites')
        .select(`
          id,
          household_id,
          email,
          created_at,
          invited_by,
          household:households(name)
        `)
        .eq('email', user.email)
        .eq('status', 'pending');

      if (error) throw error;

      // Then fetch the inviter information from household_invites table
      const invitesWithInviterEmails = await Promise.all(
        (invites || []).map(async (invite) => {
          if (!invite.invited_by) return { ...invite, inviter_email: 'Unknown' };

          // Get the inviter's email directly from the household_invites table
          const { data: inviterInvite } = await supabase
            .from('household_invites')
            .select('email')
            .eq('id', invite.invited_by)
            .maybeSingle();

          return {
            ...invite,
            inviter_email: inviterInvite?.email || 'Unknown'
          };
        })
      );

      console.log('Fetched invites:', invitesWithInviterEmails);
      setPendingInvites(invitesWithInviterEmails);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending invites",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const handleInviteResponse = async (inviteId: string, householdId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      if (status === 'rejected') {
        const { error } = await supabase
          .from('household_invites')
          .delete()
          .eq('id', inviteId);

        if (error) throw error;
      } else {
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select('members')
          .eq('id', householdId)
          .single();

        if (householdError) throw householdError;

        const updatedMembers = [...(household.members || [])];
        if (!updatedMembers.includes(user.id)) {
          updatedMembers.push(user.id);

          const { error: updateError } = await supabase
            .from('households')
            .update({ members: updatedMembers })
            .eq('id', householdId);

          if (updateError) throw updateError;

          // Update user's current_household
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ current_household: householdId })
            .eq('id', user.id);

          if (profileError) throw profileError;
        }

        const { error: deleteError } = await supabase
          .from('household_invites')
          .delete()
          .eq('id', inviteId);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Success",
        description: `Invitation ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`,
      });

      fetchPendingInvites();
      onInviteStatusChange();

      if (status === 'accepted') {
        // Refresh the page after successful acceptance
        window.location.reload();
      }
    } catch (error) {
      console.error('Error handling invite response:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} invitation`,
        variant: "destructive",
      });
    }
  };

  if (!pendingInvites.length) {
    return <p className="text-gray-500">No pending invites</p>;
  }

  return (
    <div className="space-y-2">
      {pendingInvites.map((invite) => (
        <div 
          key={invite.id} 
          className="flex items-center justify-between p-2 bg-[#e0f0dd] rounded"
        >
          <span>
            You have been invited to join "{invite.household.name}" by {invite.inviter_email}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white"
              onClick={() => handleInviteResponse(invite.id, invite.household_id, 'accepted')}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleInviteResponse(invite.id, invite.household_id, 'rejected')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};