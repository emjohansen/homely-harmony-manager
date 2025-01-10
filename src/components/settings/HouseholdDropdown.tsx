import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
  onHouseholdSelect: (household: Household) => Promise<void>;
}

export const HouseholdDropdown = ({
  households,
  currentHousehold,
  onHouseholdSelect,
}: HouseholdDropdownProps) => {
  const handleSelect = async (household: Household) => {
    try {
      console.log("Switching to household:", household); // Debugging
      await onHouseholdSelect(household);
    } catch (error) {
      console.error("Error selecting household:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {currentHousehold?.name || "Select a household"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[240px] bg-cream">
        {households.map((household) => (
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
