import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Household {
  id: string;
  name: string;
}

interface HouseholdDropdownProps {
  households: Household[];
  currentHousehold: Household | null;
}

export const HouseholdDropdown = ({
  households,
  currentHousehold,
}: HouseholdDropdownProps) => {
  const handleHouseholdSwitch = async (householdId: string) => {
    try {
      console.log('Starting household switch process...');
      console.log('New household ID:', householdId);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return;
      }
      
      if (!user) {
        console.error('No user found');
        return;
      }
      
      console.log('Current user ID:', user.id);

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_household: householdId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }

      console.log('Profile updated successfully with new household ID');
      
      // Reload the page
      console.log('Reloading page...');
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error during household switch:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {currentHousehold?.name || "Your Households"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[240px] bg-cream">
        {households.map((household) => (
          <DropdownMenuItem
            key={household.id}
            className={currentHousehold?.id === household.id ? "bg-[#e0f0dd]" : ""}
            onClick={() => handleHouseholdSwitch(household.id)}
          >
            {household.name}
          </DropdownMenuItem>
        ))}
        {households.length === 0 && (
          <DropdownMenuItem disabled>No households found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};