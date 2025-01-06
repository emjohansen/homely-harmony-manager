import { House } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InviteItem } from "./InviteItem";

interface Invite {
  id: string;
  household_id: string;
  households: {
    name: string;
  };
  status: string;
  invited_by: string;
  profiles: {
    username: string;
  };
}

interface InvitesListProps {
  invites: Invite[];
  onAccept: (inviteId: string, householdId: string) => Promise<void>;
  onDeny: (inviteId: string) => Promise<void>;
}

export const InvitesList = ({ invites, onAccept, onDeny }: InvitesListProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="pending-invites">
        <AccordionTrigger className="flex items-center gap-2">
          <House className="h-5 w-5" />
          <span>Pending Invites ({invites.length})</span>
        </AccordionTrigger>
        <AccordionContent>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-sm py-2">No pending invites</p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <InviteItem
                  key={invite.id}
                  invite={invite}
                  onAccept={onAccept}
                  onDeny={onDeny}
                />
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};