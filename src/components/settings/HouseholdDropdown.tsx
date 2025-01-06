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
  isLoading: boolean;
}

export const HouseholdDropdown = ({
  households,
  currentHousehold,
  onHouseholdSelect,
  isLoading,
}: HouseholdDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? "Switching..." : currentHousehold?.name || "Select a household"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[240px] bg-[#efffed]">
        {households.map((household) => (
          <DropdownMenuItem
            key={household.id}
            onClick={() => onHouseholdSelect(household)}
            className="cursor-pointer"
            disabled={isLoading}
          >
            {household.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};