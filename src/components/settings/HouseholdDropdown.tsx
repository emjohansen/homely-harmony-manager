import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Household {
  id: string;
  name: string;
}

interface HouseholdDropdownProps {
  households: Household[];
  currentHousehold: Household | null;
  onHouseholdSelect: (household: Household) => Promise<void>;
}

export const HouseholdDropdown = ({
  households,
  currentHousehold,
  onHouseholdSelect,
}: HouseholdDropdownProps) => {
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);

  useEffect(() => {
    const fetchUserHouseholds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Fetching households for user:", user.id);
      
      // Fetch all households where the user is either in members or admins array
      const { data: householdsData, error } = await supabase
        .from('households')
        .select('id, name')
        .or(`members.cs.{${user.id}},admins.cs.{${user.id}}`);

      if (error) {
        console.error("Error fetching households:", error);
        return;
      }

      console.log("Fetched households:", householdsData);
      setUserHouseholds(householdsData || []);
    };

    fetchUserHouseholds();
  }, []);

  const handleSelect = async (household: Household) => {
    try {
      console.log("Switching to household:", household);
      await onHouseholdSelect(household);
    } catch (error) {
      console.error("Error selecting household:", error);
    }
  };

  // Use userHouseholds instead of the passed households prop
  const displayHouseholds = userHouseholds.length > 0 ? userHouseholds : households;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {currentHousehold?.name || "Select a household"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[240px] bg-cream">
        {displayHouseholds.map((household) => (
          <DropdownMenuItem
            key={household.id}
            onClick={() => handleSelect(household)}
          >
            {household.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};