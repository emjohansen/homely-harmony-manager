import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreateHouseholdDialog } from "@/components/settings/household/CreateHouseholdDialog";
import { useToast } from "@/hooks/use-toast";

interface RequireHouseholdProps {
  children: React.ReactNode;
}

const RequireHousehold = ({ children }: RequireHouseholdProps) => {
  const [loading, setLoading] = useState(true);
  const [hasHousehold, setHasHousehold] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkHouseholdMembership = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        console.log('Checking household membership for user:', user.id);
        const { data: householdMemberships, error } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const hasHouseholdMembership = householdMemberships && householdMemberships.length > 0;
        console.log('User has household membership:', hasHouseholdMembership);
        setHasHousehold(hasHouseholdMembership);

        if (!hasHouseholdMembership && window.location.pathname !== '/settings') {
          toast({
            title: "No Household Selected",
            description: "Please create or join a household to continue.",
          });
          navigate('/settings');
        }
      } catch (error) {
        console.error('Error checking household membership:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHouseholdMembership();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
  }

  if (!hasHousehold && window.location.pathname !== '/settings') {
    return null;
  }

  return <>{children}</>;
};

export default RequireHousehold;