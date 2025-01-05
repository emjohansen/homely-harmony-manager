import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreateHouseholdDialog } from "@/components/settings/household/CreateHouseholdDialog";
import { HouseholdDropdown } from "@/components/settings/HouseholdDropdown";
import { HouseholdInvites } from "@/components/settings/HouseholdInvites";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Household {
  id: string;
  name: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("0");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

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

    if (profile?.username && profile?.current_household) {
      navigate("/recipes");
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
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentHousehold) {
      toast({
        title: "Error",
        description: "Please select or create a household first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: nickname,
          current_household: currentHousehold.id 
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been set up successfully!",
      });
      
      navigate("/recipes");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHousehold = async (household: Household) => {
    setCurrentHousehold(household);
  };

  return (
    <div className="min-h-screen bg-[#efffed] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1e251c]">Welcome to Heimen</h1>
          <p className="mt-2 text-[#1e251c]">Let's get you set up</p>
        </div>

        <div className="bg-[#e0f0dd] p-6 rounded-lg shadow-md space-y-6">
          <div>
            <Label htmlFor="nickname">Choose your nickname</Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1"
              placeholder="Enter your nickname"
            />
          </div>

          <div className="space-y-4">
            <Label>Join or create a household</Label>
            {households.length > 0 && (
              <HouseholdDropdown
                households={households}
                currentHousehold={currentHousehold}
                onHouseholdSelect={handleSelectHousehold}
              />
            )}
            <CreateHouseholdDialog onHouseholdCreated={fetchHouseholds} />
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-[#9dbc98] text-[#1e251c]">
                  Join a Household
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#efffed]">
                <DialogHeader>
                  <DialogTitle>Join a Household</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-[#1e251c]">
                    To join a household, you need to be invited using your email address:
                  </p>
                  <p className="font-medium text-[#1e251c]">{userEmail}</p>
                  <p className="text-[#1e251c]">
                    Ask a household member to send you an invitation to this email.
                    Once they do, you'll see the invitation here.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-6">
              <HouseholdInvites />
            </div>
          </div>

          <Button 
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="w-full bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-[#1e251c]"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}