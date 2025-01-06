import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberListItemProps {
  member: {
    id: string;
    username: string;
    role: string;
  };
  currentUserId: string | null;
  isAdmin: boolean;
  onRemove: (memberId: string) => void;
}

export const MemberListItem = ({ 
  member, 
  currentUserId, 
  isAdmin, 
  onRemove 
}: MemberListItemProps) => {
  const canRemoveMember = () => {
    if (isAdmin) {
      // Admin can remove anyone except themselves
      return member.id !== currentUserId;
    } else {
      // Non-admin can only remove themselves
      return member.id === currentUserId;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-mint rounded-lg">
      <div>
        <span className="font-medium">{member.username}</span>
        <span className="ml-2 text-sm text-forest/70">({member.role})</span>
      </div>
      {canRemoveMember() && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(member.id)}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};