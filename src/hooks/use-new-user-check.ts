import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNewUserCheck = (allowSettingsPage: boolean = false) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSetup = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, current_household')
          .eq('id', session.user.id)
          .single();

        const { data: householdMemberships } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id);

        const hasNickname = !!profile?.username;
        const hasHousehold = householdMemberships && householdMemberships.length > 0;

        if (!hasNickname || !hasHousehold) {
          console.log('User setup incomplete:', { hasNickname, hasHousehold });
          if (!allowSettingsPage) {
            toast({
              title: "Setup Required",
              description: "You need to have a nickname and be part of a household",
              variant: "destructive",
            });
            navigate('/settings');
          }
        }
      } catch (error) {
        console.error('Error checking user setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSetup();
  }, [navigate, toast, allowSettingsPage]);

  return { isLoading };
};