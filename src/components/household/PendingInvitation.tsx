import { Button } from "@/components/ui/button";

interface PendingInvitationProps {
  invite: any;
  currentUser: any;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}

const PendingInvitation = ({ 
  invite, 
  currentUser, 
  onAccept, 
  onDecline 
}: PendingInvitationProps) => {
  return (
    <div
      key={invite.id}
      className="p-4 bg-cream rounded-lg border border-sage/20"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            {invite.households?.name || 'Unknown Household'}
          </p>
          <p className="text-sm text-gray-600">
            {invite.invited_by === currentUser?.id
              ? `Sent to: ${invite.email}`
              : `From: ${invite.inviter?.username || 'Unknown'}`}
          </p>
        </div>
        {invite.email === currentUser?.email && (
          <div className="flex gap-2">
            <Button
              onClick={() => onAccept(invite.id)}
              className="bg-sage hover:bg-sage/90 text-forest text-sm"
            >
              Accept
            </Button>
            <Button
              onClick={() => onDecline(invite.id)}
              variant="outline"
              className="border-sage text-forest text-sm"
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingInvitation;