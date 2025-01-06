import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email);
    };
    getUser();
  }, []);

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
    toast({
      title: "Coming Soon",
      description: "Account deletion will be available in a future update",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-forest">Account</h3>
      <Card className="bg-cream border-sage">
        <CardHeader>
          <CardTitle className="text-forest">Account Information</CardTitle>
          <CardDescription className="text-forest/70">
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-forest">Email</p>
            <p className="text-sm text-forest/70">{email}</p>
          </div>
          <div className="h-px bg-sage/30" />
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
        </CardContent>
      </Card>
    </div>
  );
};