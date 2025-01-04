import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import HouseholdMembers from "./HouseholdMembers";
import PendingInvitation from "./PendingInvitation";
import HouseholdSwitcher from "./HouseholdSwitcher";

interface InvitationsListProps {
  onInviteAccepted?: () => void;
}

const InvitationsList = ({ onInviteAccepted }: InvitationsListProps) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);
  const [households, setHouseholds] = useState<any[]>([]);

  const fetchHouseholds = async (userId: string) => {
    try {
      console.log('Fetching households for user:', userId);
      const { data: memberships, error } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          households (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      console.log('Fetched memberships:', memberships);

      const formattedHouseholds = memberships?.map(membership => ({
        id: membership.households.id,
        name: membership.households.name,
        role: membership.role,
        isCreator: membership.households.created_by === userId
      })) || [];

      console.log('Formatted households:', formattedHouseholds);
      setHouseholds(formattedHouseholds);
      
      // If no current household is selected and we have households, select the first one
      if (!currentHousehold && formattedHouseholds.length > 0) {
        setCurrentHousehold(formattedHouseholds[0]);
      }
    } catch (error) {
      console.error('Error fetching households:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch households",
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      console.log('Fetching invitations...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      setCurrentUser(user);
      await fetchHouseholds(user.id);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [toast]);

  const handleHouseholdSwitch = (household: any) => {
    console.log('Switching to household:', household);
    setCurrentHousehold(household);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      if (!currentUser) return;

      const { data: invite } = await supabase
        .from('household_invites')
        .select('household_id')
        .eq('id', inviteId)
        .single();

      if (!invite) return;

      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: invite.household_id,
          user_id: currentUser.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      const { error: updateError } = await supabase
        .from('household_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "You have joined the household",
      });

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
    return <div>Loading...</div>;
  }

  const pendingInvitations = invitations.filter(invite => invite.status === 'pending');

  return (
    <div className="space-y-4">
      {households.length > 0 && (
        <HouseholdSwitcher
          households={households}
          currentHousehold={currentHousehold}
          onHouseholdSelect={handleHouseholdSwitch}
        />
      )}

      <Accordion type="single" collapsible className="w-full">
        {currentHousehold && (
          <AccordionItem value="current-household">
            <AccordionTrigger className="text-lg font-semibold">
              Household Members
            </AccordionTrigger>
            <AccordionContent>
              <HouseholdMembers
                householdId={currentHousehold.id}
                isCreator={currentHousehold.isCreator}
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
                  <PendingInvitation
                    key={invite.id}
                    invite={invite}
                    currentUser={currentUser}
                    onAccept={handleAcceptInvite}
                    onDecline={handleDeclineInvite}
                  />
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