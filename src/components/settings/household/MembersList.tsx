import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MemberItem } from "./MemberItem";
import { DeleteHouseholdDialog } from "./DeleteHouseholdDialog";

interface Member {
  id: string;
  username: string;
  role: string;
}

interface MembersListProps {
  members: Member[];
  isAdmin: boolean;
  currentUserId: string | null;
  householdId: string;
  householdName: string;
  onMemberRemoved: () => void;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export const MembersList = ({
  members,
  isAdmin,
  currentUserId,
  householdId,
  householdName,
  onMemberRemoved,
  onRemoveMember,
}: MembersListProps) => {
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveMember = async (memberId: string) => {
    try {
      setIsRemoving(true);
      await onRemoveMember(memberId);
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const canRemoveMember = (memberId: string) => {
    if (isAdmin) {
      return memberId !== currentUserId;
    } else {
      return memberId === currentUserId;
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberItem
          key={member.id}
          member={member}
          canRemove={!isRemoving && canRemoveMember(member.id)}
          onRemove={handleRemoveMember}
        />
      ))}
      {isAdmin && (
        <div className="pt-4 border-t border-mint/20 mt-4">
          <DeleteHouseholdDialog
            household={{ id: householdId, name: householdName }}
            onDelete={onMemberRemoved}
          />
        </div>
      )}
    </div>
  );
};