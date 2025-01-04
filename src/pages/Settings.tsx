import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import CreateHousehold from "@/components/household/CreateHousehold";
import InviteMember from "@/components/household/InviteMember";
import InvitationsList from "@/components/household/InvitationsList";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/");
          return;
        }

        setUserEmail(session.user.email);

        const { data: householdMember } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (householdMember) {
          const { data: household } = await supabase
            .from('households')
            .select('*')
            .eq('id', householdMember.household_id)
            .single();

          setCurrentHousehold(household);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Household</h2>
            {loading ? (
              <p>Loading...</p>
            ) : currentHousehold ? (
              <div className="space-y-4">
                <p>Your household: {currentHousehold.name}</p>
                <InviteMember householdId={currentHousehold.id} />
                <InvitationsList />
              </div>
            ) : (
              <CreateHousehold onCreated={setCurrentHousehold} />
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            {userEmail && (
              <p className="text-gray-600 mb-4">
                Signed in as: {userEmail}
              </p>
            )}
            <Button variant="destructive" onClick={handleSignOut}>
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