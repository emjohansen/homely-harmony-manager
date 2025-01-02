import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import InviteMember from "@/components/household/InviteMember";
import InvitationsList from "@/components/household/InvitationsList";

const Settings = () => {
  const { toast } = useToast();
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);

  useEffect(() => {
    const fetchHousehold = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id, households (name)')
        .eq('user_id', user.id)
        .single();

      if (householdMember) {
        setCurrentHousehold(householdMember.households);
      }
    };

    fetchHousehold();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <InvitationsList />
        
        <Card>
          <CardHeader>
            <CardTitle>Husholdning</CardTitle>
            <CardDescription>Administrer din husholdning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentHousehold ? (
              <>
                <div>
                  <h3 className="font-medium mb-2">Nåværende husholdning</h3>
                  <p>{currentHousehold.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Inviter medlem</h3>
                  <InviteMember householdId={currentHousehold.id} />
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">Du er ikke medlem av en husholdning ennå</p>
                <Button onClick={() => navigate("/household/create")}>
                  Opprett husholdning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Settings;