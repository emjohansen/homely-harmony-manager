import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const useNewUserCheck = (allowSettingsPage: boolean = false) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState<{
    hasNickname: boolean;
    hasHousehold: boolean;
  } | null>(null);

  useEffect(() => {
    const checkUserSetup = async () => {
      try {
        console.log("Starting user setup check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("No session found, redirecting to home");
          navigate('/');
          return;
        }

        console.log("Fetching profile for user:", session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, current_household')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data:", profile);

        // Check household memberships with error handling
        const { data: householdMemberships, error: membershipError } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id);

        if (membershipError) {
          console.error("Household membership fetch error:", membershipError);
          throw membershipError;
        }

        console.log("Household memberships:", householdMemberships);

        const hasNickname = !!profile?.username;
        const hasHousehold = householdMemberships && householdMemberships.length > 0;

        console.log("Setup status:", { hasNickname, hasHousehold });

        if (!hasNickname || !hasHousehold) {
          if (!allowSettingsPage) {
            setSetupNeeded({ hasNickname, hasHousehold });
            setShowSetupDialog(true);
          }
        }
      } catch (error) {
        console.error('Error in checkUserSetup:', error);
        toast({
          title: "Error checking user setup",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSetup();
  }, [navigate, allowSettingsPage, toast]);

  const handleSetupConfirm = () => {
    setShowSetupDialog(false);
    navigate('/settings?setup=required');
  };

  return { 
    isLoading,
    SetupDialog: showSetupDialog && setupNeeded ? (
      <AlertDialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <AlertDialogContent className="bg-[#efffed]">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile Setup</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              To access all features, you need to:
              {!setupNeeded.hasNickname && (
                <div className="flex items-center space-x-2">
                  <span className="text-[#1e251c]">• Set up a nickname</span>
                </div>
              )}
              {!setupNeeded.hasHousehold && (
                <div className="flex items-center space-x-2">
                  <span className="text-[#1e251c]">• Join or create a household</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 flex justify-end">
            <AlertDialogAction onClick={handleSetupConfirm} className="bg-[#9dbc98] text-[#1e251c] hover:bg-[#e0f0dd]">
              OK
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    ) : null
  };
};