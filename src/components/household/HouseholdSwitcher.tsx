import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Household {
  id: string;
  name: string;
  role: string;
}

interface HouseholdSwitcherProps {
  households?: Household[];
  currentHousehold: Household | null;
  onHouseholdSelect: (household: Household) => void;
}

const HouseholdSwitcher = ({ 
  households = [], 
  currentHousehold, 
  onHouseholdSelect 
}: HouseholdSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentHousehold?.id || "");
  
  // Early return if no households
  if (!Array.isArray(households) || households.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentHousehold?.name || "Select household..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command value={value} onValueChange={setValue}>
          <CommandInput placeholder="Search households..." />
          <CommandEmpty>No household found.</CommandEmpty>
          <CommandGroup>
            {households.map((household) => (
              <CommandItem
                key={household.id}
                value={household.id}
                onSelect={() => {
                  setValue(household.id);
                  onHouseholdSelect(household);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentHousehold?.id === household.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {household.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {household.role}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default HouseholdSwitcher;