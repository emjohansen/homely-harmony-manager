import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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
        toast.error("Failed to get user information");
        return;
      }
      
      if (!user) {
        console.error('No user found');
        toast.error("No user found");
        return;
      }
      
      console.log('Current user ID:', user.id);

      // Update the profile with new current_household using upsert
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          current_household: householdId
        });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error("Failed to update household");
        return;
      }

      console.log('Profile updated successfully');
      toast.success("Household updated successfully");
      
      // Reload the page
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error during household switch:', error);
      toast.error("An unexpected error occurred");
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