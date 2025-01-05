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

      // Get user's current household from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', userId)
        .single();

      console.log('Current household from profile:', profile?.current_household);
      
      // If there's a current household in profile and it exists in memberships
      if (profile?.current_household && formattedHouseholds.some(h => h.id === profile.current_household)) {
        const currentHouse = formattedHouseholds.find(h => h.id === profile.current_household);
        console.log('Setting current household from profile:', currentHouse);
        setCurrentHousehold(currentHouse);
      } 
      // If no current household or invalid, set to first available household
      else if (formattedHouseholds.length > 0) {
        console.log('Setting first household as current:', formattedHouseholds[0]);
        setCurrentHousehold(formattedHouseholds[0]);
        // Update profile with new current household
        await supabase
          .from('profiles')
          .update({ current_household: formattedHouseholds[0].id })
          .eq('id', userId);
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
    // Refresh the page to reset all states
    window.location.reload();
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      if (!currentUser) return;

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
          user_id: currentUser.id,
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
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "You have joined the household",
      });

      // Refresh the page to update all states
      window.location.reload();

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