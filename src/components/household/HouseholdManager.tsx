import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreateHouseholdDialog from "./CreateHouseholdDialog";
import InviteMemberDialog from "./InviteMemberDialog";
import HouseholdInvites from "./HouseholdInvites";
import HouseholdMembers from "./HouseholdMembers";

interface Household {
  id: string;
  name: string;
  created_by: string;
}

export default function HouseholdManager() {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentHousehold();
  }, []);

  const fetchCurrentHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's current household from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_household")
        .eq("id", user.id)
        .single();

      if (!profile?.current_household) {
        setIsLoading(false);
        return;
      }

      // Verify user is still a member of the household
      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .eq("household_id", profile.current_household)
        .single();

      if (!membership) {
        console.log("User is no longer a member of their current household");
        // Reset current_household in profile
        await supabase
          .from("profiles")
          .update({ current_household: null })
          .eq("id", user.id);
        setIsLoading(false);
        return;
      }

      // Get household details
      const { data: household } = await supabase
        .from("households")
        .select("*")
        .eq("id", profile.current_household)
        .single();

      if (household) {
        setCurrentHousehold(household);
        setIsAdmin(household.created_by === user.id);
      }
    } catch (error) {
      console.error("Error fetching household:", error);
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
          <CreateHouseholdDialog />
          <HouseholdInvites />
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
          />
          <HouseholdInvites />
        </div>
      )}
    </div>
  );
}