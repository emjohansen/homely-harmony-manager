import { useState, useEffect } from "react";
import { HouseholdDropdown } from "./HouseholdDropdown";
import { CreateHouseholdDialog } from "./household/CreateHouseholdDialog";
import { InviteMemberDialog } from "./household/InviteMemberDialog";
import { MembersList } from "./household/MembersList";
import { PendingInvitesList } from "./household/PendingInvitesList";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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
  admins?: string[];
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentHousehold || !currentUserId) {
        setIsAdmin(false);
        return;
      }

      const { data: household, error } = await supabase
        .from('households')
        .select('admins')
        .eq('id', currentHousehold.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(household?.admins?.includes(currentUserId) || false);
    };

    checkAdminStatus();
  }, [currentHousehold, currentUserId]);

  return (
    <div className="p-6 bg-[#efffed] rounded shadow">
      <h2 className="text-lg font-bold mb-4">Household Management</h2>
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Your Households
          </Label>
          <div className="space-y-4">
            <HouseholdDropdown
              households={households}
              currentHousehold={currentHousehold}
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

        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="members">
            <AccordionTrigger>Members</AccordionTrigger>
            <AccordionContent>
              <MembersList
                householdId={currentHousehold?.id || ''}
                isAdmin={isAdmin}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invites">
            <AccordionTrigger>Pending Invites</AccordionTrigger>
            <AccordionContent>
              <PendingInvitesList onInviteStatusChange={onHouseholdsChange} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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