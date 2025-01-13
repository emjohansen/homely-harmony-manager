import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InviteMemberDialogProps {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberInvited: () => void;
}

export const InviteMemberDialog = ({ 
  householdId, 
  open, 
  onOpenChange,
  onMemberInvited 
}: InviteMemberDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const handleInviteMember = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error: inviteError } = await supabase
        .from('household_invites')
        .insert({
          household_id: householdId,
          email: inviteEmail,
          invited_by: user.id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      
      setInviteEmail("");
      onOpenChange(false);
      onMemberInvited();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#efffed]">
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleInviteMember}
              className="bg-[#9dbc98] hover:bg-[#9dbc98]/90 text-white"
            >
              Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};