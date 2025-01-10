import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { HouseholdManagement } from "@/components/settings/HouseholdManagement";

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

    // Fetch households where user is the creator
    const { data: userHouseholds } = await supabase
      .from('households')
      .select('id, name')
      .eq('created_by', user.id);

    if (userHouseholds) {
      setHouseholds(userHouseholds);

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (profile?.current_household) {
        const current = userHouseholds.find(h => h.id === profile.current_household);
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
            onHouseholdsChange={fetchHouseholds}
          />

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
