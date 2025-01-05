import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HouseholdSwitcher from "./HouseholdSwitcher";
import HouseholdAccordion from "./HouseholdAccordion";
import { useHouseholds } from "./hooks/useHouseholds";
import { useInvitations } from "./hooks/useInvitations";

interface InvitationsListProps {
  onInviteAccepted?: () => void;
}

const InvitationsList = ({ onInviteAccepted }: InvitationsListProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { households, currentHousehold, loading, fetchHouseholds, setCurrentHousehold } = useHouseholds(currentUser?.id);
  const { invitations, fetchInvitations, handleAcceptInvite, handleDeclineInvite } = useInvitations(onInviteAccepted);

  useEffect(() => {
    const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      setCurrentUser(user);
      await fetchInvitations(user.id);
    };

    initializeData();
  }, []);

  const handleHouseholdSwitch = async (household: any) => {
    try {
      setCurrentHousehold(household);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          current_household: household.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Refresh the page to reset all states
      window.location.reload();
    } catch (error) {
      console.error('Error switching household:', error);
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
        onAcceptInvite={(inviteId) => handleAcceptInvite(inviteId, currentUser.id, households)}
        onDeclineInvite={handleDeclineInvite}
        onMembershipChange={() => fetchHouseholds(currentUser?.id)}
      />
    </div>
  );
};

export default InvitationsList;