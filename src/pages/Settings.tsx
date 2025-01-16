import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { HouseholdManagement } from "@/components/settings/HouseholdManagement";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error("Session expired. Please login again.");
          navigate("/");
          return;
        }

        if (!session) {
          console.log('No active session found');
          toast.error("Please login to continue");
          navigate("/");
          return;
        }

        setUserEmail(session.user.email);
        await Promise.all([checkUser(), fetchHouseholds()]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast.error("An error occurred. Please try again.");
        navigate("/");
      }
    };

    initializeSettings();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/");
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, current_household')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (profileError.message.includes('JWT')) {
          toast.error("Session expired. Please login again");
          navigate("/");
          return;
        }
        return;
      }

      if (profile?.username) {
        setNickname(profile.username);
      }

      if (profile?.current_household) {
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select('id, name')
          .eq('id', profile.current_household)
          .single();

        if (householdError) {
          console.error('Error fetching household:', householdError);
          return;
        }

        if (household) {
          setCurrentHousehold(household);
        }
      }
    } catch (error) {
      console.error('Error in checkUser:', error);
      toast.error("An error occurred while fetching user data");
    }
  };

  const fetchHouseholds = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error("Session expired. Please login again");
        navigate("/");
        return;
      }

      const { data: userHouseholds, error: householdsError } = await supabase
        .from('households')
        .select('id, name')
        .or(`members.cs.{${session.user.id}},admins.cs.{${session.user.id}}`);

      if (householdsError) {
        console.error("Error fetching households:", householdsError);
        if (householdsError.message.includes('JWT')) {
          toast.error("Session expired. Please login again");
          navigate("/");
          return;
        }
        toast.error("Failed to fetch households");
        return;
      }

      if (userHouseholds) {
        console.log("Fetched households:", userHouseholds);
        setHouseholds(userHouseholds);

        if (!currentHousehold) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_household')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }

          if (profile?.current_household) {
            const current = userHouseholds.find(h => h.id === profile.current_household);
            if (current) {
              console.log("Setting current household:", current);
              setCurrentHousehold(current);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchHouseholds:', error);
      toast.error("An error occurred while fetching households");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error("Failed to sign out");
        return;
      }
      navigate("/");
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      toast.error("An error occurred while signing out");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-sage">Loading...</div>
      </div>
    );
  }

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