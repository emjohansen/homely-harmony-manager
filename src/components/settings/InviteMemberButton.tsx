import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InviteMemberButtonProps {
  householdId: string | null;
}

export const InviteMemberButton = ({ householdId }: InviteMemberButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const handleInviteMember = async () => {
    if (!householdId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('household_invites')
        .insert([{
          household_id: householdId,
          email: inviteEmail,
          invited_by: user.id
        }]);

      if (error) throw error;

      setInviteEmail("");
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Invitation sent successfully.",
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!householdId) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-2">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite People
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-cream">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="inviteEmail">Email Address</Label>
            <Input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <Button
            onClick={handleInviteMember}
            className="w-full"
          >
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};