import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import HouseholdMembers from "./HouseholdMembers";
import PendingInvitation from "./PendingInvitation";

interface HouseholdAccordionProps {
  currentHousehold: any;
  pendingInvitations: any[];
  currentUser: any;
  onAcceptInvite: (id: string) => Promise<void>;
  onDeclineInvite: (id: string) => Promise<void>;
  onMembershipChange: () => Promise<void>;
}

export default function HouseholdAccordion({
  currentHousehold,
  pendingInvitations,
  currentUser,
  onAcceptInvite,
  onDeclineInvite,
  onMembershipChange,
}: HouseholdAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {currentHousehold && (
        <AccordionItem value="current-household">
          <AccordionTrigger className="text-lg font-semibold">
            Household Members
          </AccordionTrigger>
          <AccordionContent>
            <HouseholdMembers
              householdId={currentHousehold.id}
              isAdmin={currentHousehold.isCreator}
              onMembershipChange={onMembershipChange}
            />
          </AccordionContent>
        </AccordionItem>
      )}
      
      {pendingInvitations.length > 0 && (
        <AccordionItem value="invitations">
          <AccordionTrigger className="text-lg font-semibold">
            Pending Invitations ({pendingInvitations.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {pendingInvitations.map((invite) => (
                <PendingInvitation
                  key={invite.id}
                  invite={invite}
                  currentUser={currentUser}
                  onAccept={onAcceptInvite}
                  onDecline={onDeclineInvite}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}