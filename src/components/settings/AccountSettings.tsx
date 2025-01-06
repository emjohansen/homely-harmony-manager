import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    // For now, just show a toast that this feature is coming soon
    toast({
      title: "Coming Soon",
      description: "Account deletion will be available in a future update",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-forest">Account</h3>
      <div className="space-y-4">
        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-forest text-forest hover:bg-sage/20"
        >
          Sign Out
        </Button>
        <Button 
          onClick={handleDeleteAccount}
          variant="outline"
          className="w-full border-forest text-forest hover:bg-sage/20"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};