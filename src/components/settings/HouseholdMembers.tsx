import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useHouseholdRole } from "@/hooks/use-household-role";
import { DeleteHouseholdDialog } from "./household/DeleteHouseholdDialog";
import { HouseholdMembersList } from "./household/HouseholdMembersList";

interface HouseholdMembersProps {
  householdId: string;
  onMemberRemoved: () => void;
}

export const HouseholdMembers = ({ householdId, onMemberRemoved }: HouseholdMembersProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isAdmin } = useHouseholdRole(householdId);

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

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="members">
        <AccordionTrigger>
          Household Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            <HouseholdMembersList
              householdId={householdId}
              isAdmin={isAdmin}
            />

            {isAdmin && (
              <div className="pt-4">
                <DeleteHouseholdDialog
                  household={{ id: householdId, name: "Current Household" }}
                  onDelete={onMemberRemoved}
                />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};