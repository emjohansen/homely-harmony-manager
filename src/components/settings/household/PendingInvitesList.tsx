import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

interface PendingInvite {
  id: string;
  email: string;
  created_at: string;
}

interface PendingInvitesListProps {
  householdId: string;
  onInviteStatusChange: () => void;
}

export const PendingInvitesList = ({ householdId, onInviteStatusChange }: PendingInvitesListProps) => {
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const { toast } = useToast();

  const fetchPendingInvites = async () => {
    try {
      const { data: invites, error } = await supabase
        .from('household_invites')
        .select('id, email, created_at')
        .eq('household_id', householdId)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingInvites(invites || []);
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
    if (householdId) {
      fetchPendingInvites();
    }
  }, [householdId]);

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    try {
      if (status === 'rejected') {
        const { error } = await supabase
          .from('household_invites')
          .delete()
          .eq('id', inviteId);

        if (error) throw error;
      } else {
        // Get the invite details first
        const { data: invite, error: inviteError } = await supabase
          .from('household_invites')
          .select('email')
          .eq('id', inviteId)
          .single();

        if (inviteError) throw inviteError;

        // Get the user's profile ID from their email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', invite.email)
          .single();

        if (profileError) throw profileError;

        // Get current members array
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select('members')
          .eq('id', householdId)
          .single();

        if (householdError) throw householdError;

        // Add new member to array if not already present
        const updatedMembers = [...(household.members || [])];
        if (!updatedMembers.includes(profile.id)) {
          updatedMembers.push(profile.id);

          // Update the household with new members array
          const { error: updateError } = await supabase
            .from('households')
            .update({ members: updatedMembers })
            .eq('id', householdId);

          if (updateError) throw updateError;
        }

        // Delete the invite after successful acceptance
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
          <span>{invite.email}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white"
              onClick={() => handleInviteResponse(invite.id, 'accepted')}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleInviteResponse(invite.id, 'rejected')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};