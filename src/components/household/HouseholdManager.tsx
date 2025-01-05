import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateHouseholdDialog from "./CreateHouseholdDialog";
import InviteMemberDialog from "./InviteMemberDialog";
import HouseholdInvites from "./HouseholdInvites";
import HouseholdMembers from "./HouseholdMembers";
import { useToast } from "@/hooks/use-toast";

interface Household {
  id: string;
  name: string;
  created_by: string;
}

export default function HouseholdManager() {
  const { toast } = useToast();
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentHousehold();
  }, []);

  const fetchCurrentHousehold = async () => {
    try {
      console.log('Fetching current household...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setIsLoading(false);
        return;
      }

      // Get user's current household from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("current_household")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profile);

      if (!profile?.current_household) {
        console.log('No current household set');
        setIsLoading(false);
        return;
      }

      // Get household details and verify membership
      const { data: household, error: householdError } = await supabase
        .from("households")
        .select(`
          *,
          household_members!inner (
            user_id,
            role
          )
        `)
        .eq('id', profile.current_household)
        .eq('household_members.user_id', user.id)
        .single();

      if (householdError) {
        console.error('Error fetching household:', householdError);
        // If there's an error, reset the current_household in profile
        await supabase
          .from("profiles")
          .update({ 
            current_household: null,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
        setCurrentHousehold(null);
      } else if (household) {
        console.log('Found household:', household);
        setCurrentHousehold(household);
        setIsAdmin(household.created_by === user.id);
      }
    } catch (error) {
      console.error("Error in fetchCurrentHousehold:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch household information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {!currentHousehold ? (
        <div className="space-y-4">
          <p className="text-center text-gray-500">
            You are not part of any household
          </p>
          <CreateHouseholdDialog onHouseholdCreated={fetchCurrentHousehold} />
          <HouseholdInvites onInviteAccepted={fetchCurrentHousehold} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{currentHousehold.name}</h1>
            {isAdmin && (
              <InviteMemberDialog householdId={currentHousehold.id} />
            )}
          </div>
          <HouseholdMembers
            householdId={currentHousehold.id}
            isAdmin={isAdmin}
            onMembershipChange={fetchCurrentHousehold}
          />
          <HouseholdInvites onInviteAccepted={fetchCurrentHousehold} />
        </div>
      )}
    </div>
  );
}