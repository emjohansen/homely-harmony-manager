import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import CreateHousehold from "@/components/household/CreateHousehold";
import InviteMember from "@/components/household/InviteMember";
import InvitationsList from "@/components/household/InvitationsList";
import HouseholdMembers from "@/components/household/HouseholdMembers";

const Settings = () => {
  const navigate = useNavigate();
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasPendingInvites, setHasPendingInvites] = useState(false);

  const fetchHouseholdData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      setUserEmail(session.user.email);
      setCurrentUserId(session.user.id);
      console.log("Fetching household data for user:", session.user.id);

      // Check for pending invites
      const { data: pendingInvites } = await supabase
        .from('household_invites')
        .select('*')
        .eq('email', session.user.email)
        .eq('status', 'pending');

      setHasPendingInvites(pendingInvites && pendingInvites.length > 0);

      // First get the household member entry for the current user
      const { data: householdMember, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching household member:', memberError);
        throw memberError;
      }

      if (householdMember) {
        console.log("Found household membership:", householdMember);
        // Then fetch the full household details
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select(`
            *,
            household_members!inner (
              user_id,
              role
            )
          `)
          .eq('id', householdMember.household_id)
          .single();

        if (householdError) {
          console.error('Error fetching household:', householdError);
          throw householdError;
        }

        console.log("Fetched household details:", household);
        setCurrentHousehold(household);
      } else {
        console.log("User is not a member of any household");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholdData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleHouseholdCreated = async (household: any) => {
    console.log("Household created:", household);
    setCurrentHousehold(household);
  };

  const handleMembershipChange = () => {
    console.log("Membership changed, refreshing household data...");
    fetchHouseholdData();
  };

  const isCreator = currentHousehold?.created_by === currentUserId;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile and Settings</h1>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Household</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <InvitationsList onInviteAccepted={handleMembershipChange} />
                
                {!currentHousehold && !hasPendingInvites && (
                  <div className="mt-4">
                    <CreateHousehold onCreated={handleHouseholdCreated} />
                  </div>
                )}

                {currentHousehold && (
                  <div className="space-y-4 mt-4">
                    <p>Your household: {currentHousehold.name}</p>
                    <InviteMember householdId={currentHousehold.id} />
                    <HouseholdMembers 
                      householdId={currentHousehold.id}
                      isCreator={isCreator}
                      onMembershipChange={handleMembershipChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            {userEmail && (
              <p className="text-gray-600 mb-4">
                Signed in as: {userEmail}
              </p>
            )}
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Settings;