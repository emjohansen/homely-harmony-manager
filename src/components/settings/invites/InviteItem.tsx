import { House } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteItemProps {
  invite: {
    id: string;
    household_id: string;
    households: {
      name: string;
    };
    profiles?: {
      username: string;
    };
  };
  onAccept: (inviteId: string, householdId: string) => Promise<void>;
  onDeny: (inviteId: string) => Promise<void>;
}

export const InviteItem = ({ invite, onAccept, onDeny }: InviteItemProps) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
      <div className="flex items-center gap-2">
        <House className="h-5 w-5 text-sage" />
        <div className="flex flex-col">
          <span className="font-medium">{invite.households.name}</span>
          <span className="text-sm text-gray-500">
            Invited by {invite.profiles?.username || 'Unknown'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(invite.id, invite.household_id)}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDeny(invite.id)}
        >
          Deny
        </Button>
      </div>
    </div>
  );
};