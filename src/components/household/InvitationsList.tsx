import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import HouseholdSwitcher from "./HouseholdSwitcher";
import HouseholdAccordion from "./HouseholdAccordion";

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

      if (error) {
        console.error('Error fetching households:', error);
        throw error;
      }

      console.log('Fetched memberships:', memberships);

      if (!Array.isArray(memberships)) {
        console.log('No memberships found or invalid data');
        setHouseholds([]);
        return;
      }

      const formattedHouseholds = memberships.map(membership => ({
        id: membership.households.id,
        name: membership.households.name,
        role: membership.role,
        isCreator: membership.households.created_by === userId
      }));

      console.log('Formatted households:', formattedHouseholds);
      setHouseholds(formattedHouseholds);
      
      // Get the stored household ID
      const storedHouseholdId = localStorage.getItem('currentHouseholdId');
      
      // If there's a stored ID and it exists in the households list, use it
      const storedHousehold = formattedHouseholds.find(h => h.id === storedHouseholdId);
      if (storedHouseholdId && storedHousehold) {
        console.log('Setting stored household as current:', storedHousehold);
        setCurrentHousehold(storedHousehold);
      } 
      // Otherwise, if we have households but no current one, select the first one
      else if (!currentHousehold && formattedHouseholds.length > 0) {
        console.log('Setting first household as current:', formattedHouseholds[0]);
        setCurrentHousehold(formattedHouseholds[0]);
        localStorage.setItem('currentHouseholdId', formattedHouseholds[0].id);
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
  }, []);

  const handleHouseholdSwitch = (household: any) => {
    console.log('Switching to household:', household);
    setCurrentHousehold(household);
    localStorage.setItem('currentHouseholdId', household.id);
    // Refresh the page to reset all states
    window.location.reload();
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

      <HouseholdAccordion
        currentHousehold={currentHousehold}
        pendingInvitations={pendingInvitations}
        currentUser={currentUser}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
        onMembershipChange={fetchInvitations}
      />
    </div>
  );
};

export default InvitationsList;
