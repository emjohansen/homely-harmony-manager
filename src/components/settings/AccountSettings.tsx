import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccountSettingsProps {
  userEmail: string | null;
  initialNickname: string;
}

export const AccountSettings = ({ userEmail, initialNickname }: AccountSettingsProps) => {
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }

        if (!user) {
          console.log('No user found during nickname fetch');
          return;
        }

        console.log('Fetching nickname for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        console.log('Fetched profile:', profile);
        if (profile?.username) {
          setNickname(profile.username);
        }
      } catch (error) {
        console.error('Error in fetchNickname:', error);
      }
    };

    fetchNickname();
  }, []);

  const handleUpdateNickname = async () => {
    setIsLoading(true);
    try {
      console.log('Starting nickname update...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user for update:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('No user found for update');
        throw new Error("No user found");
      }

      console.log('Updating nickname for user:', user.id, 'to:', nickname);
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username: nickname,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating nickname:', updateError);
        throw updateError;
      }

      console.log('Update successful:', data);
      toast({
        title: "Success",
        description: "Your nickname has been updated.",
      });
    } catch (error) {
      console.error('Error in handleUpdateNickname:', error);
      toast({
        title: "Error",
        description: "Failed to update nickname. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#efffed] p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-[#1e251c]">Account Settings</h2>
      <div className="space-y-4">
        {userEmail && (
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-[#1e251c]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="mt-1 bg-[#e0f0dd]"
            />
          </div>
        )}

        <div>
          <Label htmlFor="nickname" className="text-sm font-medium text-[#1e251c]">
            Nickname
          </Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1"
            placeholder="Enter your nickname"
          />
        </div>

        <Button 
          onClick={handleUpdateNickname}
          disabled={isLoading}
          className="w-full bg-[#9dbc98] hover:bg-[#e0f0dd] text-[#1e251c]"
        >
          {isLoading ? "Updating..." : "Update Nickname"}
        </Button>
      </div>
    </div>
  );
};