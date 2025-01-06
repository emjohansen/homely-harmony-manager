import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex items-center justify-between p-2 bg-[#e0f0dd] rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-medium">{member.username}</span>
        <Badge variant="outline" className="text-[#1e251c] border-[#9dbc98]">
          {member.role}
        </Badge>
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