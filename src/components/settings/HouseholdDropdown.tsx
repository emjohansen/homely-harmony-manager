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
import { useToast } from "@/hooks/use-toast";

interface Household {
  id: string;
  name: string;
}

interface HouseholdDropdownProps {
  households: Household[];
  currentHousehold: Household | null;
  onHouseholdSelect: (household: Household) => void;
}

export const HouseholdDropdown = ({
  households,
  currentHousehold,
  onHouseholdSelect,
}: HouseholdDropdownProps) => {
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserHouseholds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Fetching households for user:", user.id);
      
      const { data: householdsData, error } = await supabase
        .from('households')
        .select('id, name')
        .or(`members.cs.{${user.id}},admins.cs.{${user.id}}`);

      if (error) {
        console.error("Error fetching households:", error);
        toast({
          title: "Error",
          description: "Failed to fetch households",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched households:", householdsData);
      setUserHouseholds(householdsData || []);
    };

    fetchUserHouseholds();
  }, [toast]);

  const handleSelect = async (household: Household) => {
    console.log("Switching to household:", household);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to switch households",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        current_household: household.id
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error switching household:', error);
      toast({
        title: "Error",
        description: "Failed to switch household",
        variant: "destructive",
      });
      return;
    }

    console.log("Successfully switched to household:", household.name);
    toast({
      title: "Success",
      description: `Switched to ${household.name}`,
    });

    onHouseholdSelect(household);
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
        {userHouseholds.map((household) => (
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