import { useState } from "react";
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

  const handleUpdateNickname = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ username: nickname })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your nickname has been updated.",
      });
    } catch (error) {
      console.error('Error updating nickname:', error);
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
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
          onClick={handleUpdateNickname}
          disabled={isLoading}
          className="w-full bg-sage hover:bg-mint text-cream"
        >
          {isLoading ? "Updating..." : "Update Nickname"}
        </Button>
      </div>
    </div>
  );
};