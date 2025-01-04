import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import HouseholdMembers from "./HouseholdMembers";

interface InvitationsListProps {
  onInviteAccepted?: () => void;
}

const InvitationsList = ({ onInviteAccepted }: InvitationsListProps) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);

  const fetchInvitations = async () => {
    try {
      console.log('Fetching invitations...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      setCurrentUser(user);

      // Fetch current household membership
      const { data: memberData } = await supabase
        .from('household_members')
        .select('household_id, households(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentHousehold(memberData?.households || null);

      // Fetch both sent and received invitations
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

  useEffect(() => {
    fetchInvitations();
  }, [toast]);

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      if (!currentUser) return;

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
          user_id: currentUser.id,
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

      // Call the callback if provided
      if (onInviteAccepted) {
        onInviteAccepted();
      }

      fetchInvitations();
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

      fetchInvitations();
    } catch (error) {
      console.error('Error declining invite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not decline invitation",
      });
    }
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  const pendingInvitations = invitations.filter(invite => invite.status === 'pending');
  const isHouseholdCreator = currentHousehold?.created_by === currentUser?.id;

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {currentHousehold && (
          <AccordionItem value="current-household">
            <AccordionTrigger className="text-lg font-semibold">
              Current Household: {currentHousehold.name}
            </AccordionTrigger>
            <AccordionContent>
              <HouseholdMembers
                householdId={currentHousehold.id}
                isCreator={isHouseholdCreator}
                onMembershipChange={fetchInvitations}
              />
            </AccordionContent>
          </AccordionItem>
        )}
        
        {pendingInvitations.length > 0 && (
          <AccordionItem value="invitations">
            <AccordionTrigger className="text-lg font-semibold">
              Pending Invitations ({pendingInvitations.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {pendingInvitations.map((invite) => (
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
                          {invite.invited_by === currentUser?.id
                            ? `Sent to: ${invite.email}`
                            : `From: ${invite.inviter?.username || 'Unknown'}`}
                        </p>
                      </div>
                      {invite.email === currentUser?.email && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptInvite(invite.id)}
                            className="bg-sage hover:bg-sage/90 text-forest text-sm"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleDeclineInvite(invite.id)}
                            variant="outline"
                            className="border-sage text-forest text-sm"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default InvitationsList;