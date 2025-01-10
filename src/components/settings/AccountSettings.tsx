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
  const [nickname, setNickname] = useState(initialNickname);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("Error fetching user:", userError);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (profile?.username) {
          setNickname(profile.username);
        }
      } catch (error) {
        console.error("Error in fetchNickname:", error);
      }
    };

    fetchNickname();
  }, []);

  const handleUpdateNickname = async () => {
    console.log("Button clicked to update nickname"); // For debugging button clicks
    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your nickname.",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert([{ id: user.id, username: nickname }]); // Use upsert for both update and insert

      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast({
          title: "Error",
          description: "Failed to update nickname. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your nickname has been updated.",
      });
    } catch (error) {
      console.error("Unhandled error updating nickname:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Account Settings v2</h2>
      <div className="space-y-4">
        {userEmail && (
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>
        )}

        <div>
          <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
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
          onClick={handleUpdateNickname} // Ensure function is called on button click
          disabled={isLoading}
          className="w-full bg-sage hover:bg-mint text-cream"
        >
          {isLoading ? "Updating..." : "Update Nickname"}
        </Button>
      </div>
    </div>
  );
};
