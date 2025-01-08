import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Member {
  id: string;
  username: string | null;
  role: string;
}

interface MemberListProps {
  members: Member[];
  canRemoveMember: (memberId: string) => boolean;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export const MemberList = ({ members, canRemoveMember, onRemoveMember }: MemberListProps) => {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 bg-mint rounded-lg"
        >
          <div>
            <span className="font-medium">{member.username}</span>
            <span className="ml-2 text-sm text-forest/70">({member.role})</span>
          </div>
          {canRemoveMember(member.id) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveMember(member.id)}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};