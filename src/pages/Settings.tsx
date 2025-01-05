import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
    setUserEmail(session.user.email);
    
    // Fetch the user's current nickname
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.username) {
      setNickname(profile.username);
    }
  };

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
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

              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full mt-4"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}