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
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Early return if no households
  if (!Array.isArray(households)) {
    return null;
  }

  const handleHouseholdSelect = async (household: Household) => {
    console.log("Switching to household:", household);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Update the user's current household in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_household: household.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Store in localStorage as backup
      localStorage.setItem('currentHouseholdId', household.id);
      
      // Call the parent component's handler
      onHouseholdSelect(household);
      
      toast({
        title: "Household switched",
        description: `Switched to ${household.name}`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Error switching household:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not switch household. Please try again.",
      });
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