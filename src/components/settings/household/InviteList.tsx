import { useState } from "react";
import { House } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteListProps {
  invites: Array<{
    id: string;
    household_id: string;
    households: {
      name: string;
    };
    profiles: {
      username: string;
    } | null;
  }>;
  onAccept: (inviteId: string, householdId: string) => Promise<void>;
  onDeny: (inviteId: string) => Promise<void>;
}

export const InviteList = ({ invites, onAccept, onDeny }: InviteListProps) => {
  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <div key={invite.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
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
      ))}
    </div>
  );
};