import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { HouseholdManagement } from "@/components/settings/HouseholdManagement";
import { HouseholdInvites } from "@/components/settings/HouseholdInvites";
import { useToast } from "@/hooks/use-toast";

interface Household {
  id: string;
  name: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUser();
    fetchHouseholds();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setUserEmail(session.user.email);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, current_household')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profile?.username) {
        setNickname(profile.username);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const fetchHouseholds = async () => {
    try {
      console.log("Fetching households...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      const { data: memberHouseholds, error: memberError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          households:household_id (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      console.log("Fetched member households:", memberHouseholds);

      if (memberHouseholds) {
        const households = memberHouseholds.map(mh => ({
          id: mh.households.id,
          name: mh.households.name
        }));
        setHouseholds(households);

        const { data: profile } = await supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single();

        if (profile?.current_household) {
          const current = households.find(h => h.id === profile.current_household);
          setCurrentHousehold(current || null);
        }
      }
    } catch (error) {
      console.error("Error in fetchHouseholds:", error);
      toast({
        title: "Error",
        description: "Failed to fetch households. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectHousehold = async (household: Household) => {
    try {
      setIsLoading(true);
      console.log("Selecting household:", household);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // First, update the local state
      setCurrentHousehold(household);

      // Then, update the database
      const { error } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Switched to ${household.name}`,
      });

      // Refresh the page to update all components
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating active household:', error);
      // Revert the local state if the update failed
      setCurrentHousehold(currentHousehold);
      toast({
        title: "Error",
        description: "Failed to switch household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          <AccountSettings 
            userEmail={userEmail} 
            initialNickname={nickname} 
          />
          
          <HouseholdManagement
            households={households}
            currentHousehold={currentHousehold}
            onHouseholdSelect={handleSelectHousehold}
            onHouseholdsChange={fetchHouseholds}
            isLoading={isLoading}
          />

          <HouseholdInvites />

          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign out
          </Button>
        </div>
      </div>
      <Navigation />
    </div>
  );
}