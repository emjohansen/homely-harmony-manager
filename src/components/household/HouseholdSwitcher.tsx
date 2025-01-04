import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import CreateHousehold from "./CreateHousehold";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Early return if no households
  if (!Array.isArray(households)) {
    return null;
  }

  const handleHouseholdSelect = async (household: Household) => {
    console.log("Switching to household:", household);
    
    try {
      // Store the selected household ID in localStorage
      localStorage.setItem('currentHouseholdId', household.id);
      
      // Call the parent component's handler
      onHouseholdSelect(household);
      
      setValue(household.id);
      setOpen(false);
    } catch (error) {
      console.error('Error switching household:', error);
    }
  };

  const handleCreateSuccess = (newHousehold: any) => {
    setShowCreateDialog(false);
    handleHouseholdSelect(newHousehold);
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
          <Command 
            value={value} 
            onValueChange={setValue} 
            className="bg-[#efffed]"
          >
            <CommandInput placeholder="Search households..." className="bg-[#efffed]" />
            <CommandEmpty>No household found.</CommandEmpty>
            <CommandGroup>
              {households.map((household) => (
                <CommandItem
                  key={household.id}
                  value={household.id}
                  onSelect={() => handleHouseholdSelect(household)}
                  className="bg-[#efffed] hover:bg-mint"
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
            <CommandSeparator className="bg-sage/20" />
            <CommandGroup>
              <DialogTrigger asChild>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                  }}
                  className="bg-[#efffed] hover:bg-mint"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Household
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <CreateHousehold onCreated={handleCreateSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default HouseholdSwitcher;