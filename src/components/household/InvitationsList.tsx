import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const InvitationsList = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        console.log('Fetching invitations...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return;
        }

        // Fetch both sent and received invitations
        const { data, error } = await supabase
          .from('household_invites')
          .select(`
            *,
            households:household_id (name),
            inviter:invited_by (username)
          `)
          .or(`email.eq.${user.email},invited_by.eq.${user.id}`);

        if (error) {
          console.error('Error fetching invitations:', error);
          throw error;
        }

        console.log('Fetched invitations:', data);
        setInvitations(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch invitations",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [toast]);

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: invite } = await supabase
        .from('household_invites')
        .select('household_id')
        .eq('id', inviteId)
        .single();

      if (!invite) return;

      // Add user to household_members
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: invite.household_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('household_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "You have joined the household",
      });

      // Refresh invitations list
      window.location.reload();
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not accept invitation",
      });
    }
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Invitations</h3>
      {invitations.length === 0 ? (
        <p className="text-gray-500">No invitations found</p>
      ) : (
        <div className="space-y-3">
          {invitations.map((invite) => (
            <div
              key={invite.id}
              className="p-4 bg-cream rounded-lg border border-sage/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {invite.households?.name || 'Unknown Household'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {invite.invited_by === invite.user?.id
                      ? `Sent to: ${invite.email}`
                      : `From: ${invite.inviter?.username || 'Unknown'}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {invite.status}
                  </p>
                </div>
                {invite.status === 'pending' && invite.email === invite.user?.email && (
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="px-3 py-1 bg-sage text-forest rounded hover:bg-sage/90 text-sm"
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsList;