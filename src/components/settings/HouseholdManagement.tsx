import { useState, useEffect } from "react";
import { HouseholdDropdown } from "./HouseholdDropdown";
import { CreateHouseholdDialog } from "./household/CreateHouseholdDialog";
import { InviteMemberDialog } from "./household/InviteMemberDialog";
import { MembersList } from "./household/MembersList";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdRole } from "@/hooks/use-household-role";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface Household {
  id: string;
  name: string;
}

interface HouseholdManagementProps {
  households: Household[];
  currentHousehold: Household | null;
  onHouseholdsChange: () => void;
}

export const HouseholdManagement = ({
  households,
  currentHousehold,
  onHouseholdsChange,
}: HouseholdManagementProps) => {
  const { toast } = useToast();
  const { isAdmin } = useHouseholdRole(currentHousehold?.id || null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();
  }, []);

  const handleHouseholdSelect = async (household: Household) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ current_household: household.id })
        .eq("id", currentUserId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Current household updated successfully.",
      });
      
      onHouseholdsChange();
    } catch (error) {
      console.error("Error updating current household:", error);
      toast({
        title: "Error",
        description: "Failed to update current household.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 bg-[#efffed] rounded shadow">
      <h2 className="text-lg font-bold mb-4">Household Management</h2>
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Current Household
          </Label>
          <div className="space-y-4">
            <HouseholdDropdown
              households={households}
              currentHousehold={currentHousehold}
              onHouseholdSelect={handleHouseholdSelect}
            />
            {currentHousehold && isAdmin && (
              <Button 
                onClick={() => setIsInviteDialogOpen(true)}
                className="w-full bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        </div>

        {currentHousehold && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="members">
              <AccordionTrigger>Members</AccordionTrigger>
              <AccordionContent>
                <MembersList
                  householdId={currentHousehold.id}
                  isAdmin={isAdmin}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <CreateHouseholdDialog onHouseholdsChange={onHouseholdsChange} />

        {currentHousehold && isAdmin && (
          <InviteMemberDialog
            householdId={currentHousehold.id}
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            onMemberInvited={onHouseholdsChange}
          />
        )}
      </div>
    </div>
  );
};

export default HouseholdManagement;