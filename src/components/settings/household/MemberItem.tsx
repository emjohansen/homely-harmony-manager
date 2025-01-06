import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberItemProps {
  member: {
    id: string;
    username: string;
    role: string;
  };
  canRemove: boolean;
  onRemove: (memberId: string) => void;
}

export const MemberItem = ({ member, canRemove, onRemove }: MemberItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 bg-mint rounded-lg">
      <div>
        <span className="font-medium">{member.username}</span>
        <span className="ml-2 text-sm text-forest/70">({member.role})</span>
      </div>
      {canRemove && (
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