import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MemberListItem } from "./MemberListItem";
import { InviteMemberForm } from "./InviteMemberForm";
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMembersListProps } from "@/types/household";
import { useHouseholdMembersManagement } from "@/hooks/use-household-members-management";

export const HouseholdMembersList = ({ householdId, isAdmin }: HouseholdMembersListProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { members, inviteMember, removeMember, fetchMembers } = useHouseholdMembersManagement(householdId);

  useEffect(() => {
    fetchMembers();
    getCurrentUser();
  }, [householdId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <InviteMemberForm onInvite={inviteMember} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <MemberListItem
            key={member.id}
            username={member.username || 'Unknown User'}
            role={member.role}
            showRemoveButton={isAdmin && member.id !== currentUserId}
            onRemove={() => removeMember(member.id)}
          />
        ))}
      </div>
    </div>
  );
};