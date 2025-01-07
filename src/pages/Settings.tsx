import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { HouseholdManagement } from "@/components/settings/HouseholdManagement";
import { HouseholdInvites } from "@/components/settings/HouseholdInvites";

interface Household {
  id: string;
  name: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  useEffect(() => {
    checkUser();
    fetchHouseholds();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
    setUserEmail(session.user.email);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, current_household')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.username) {
      setNickname(profile.username);
    }
  };

  const fetchHouseholds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberHouseholds } = await supabase
      .from('household_members')
      .select('household_id, households:household_id(id, name)')
      .eq('user_id', user.id);

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
  };

  const handleSelectHousehold = async (household: Household) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentHousehold(household);
      
      // Force reload the page to refresh all data
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating active household:', error);
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