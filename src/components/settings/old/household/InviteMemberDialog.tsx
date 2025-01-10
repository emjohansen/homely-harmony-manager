import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InviteMemberDialogProps {
  householdId: string;
  onMemberInvited: () => void;
}

export const InviteMemberDialog = ({ householdId, onMemberInvited }: InviteMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const handleInviteMember = async () => {
    try {
      // First get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', inviteEmail)
        .single();

      if (profileError) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Get current members array
      const { data: household, error: fetchError } = await supabase
        .from('households')
        .select('members')
        .eq('id', householdId)
        .single();

      if (fetchError) throw fetchError;

      // Add new member to array if not already present
      const currentMembers = household.members || [];
      if (!currentMembers.includes(profile.id)) {
        const { error: updateError } = await supabase
          .from('households')
          .update({
            members: [...currentMembers, profile.id]
          })
          .eq('id', householdId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "Member invited successfully",
      });
      
      setIsOpen(false);
      setInviteEmail("");
      onMemberInvited();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            />
            <Button onClick={handleInviteMember}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
