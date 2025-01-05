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
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

interface InviteMemberDialogProps {
  householdId: string;
}

export default function InviteMemberDialog({ householdId }: InviteMemberDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Check for existing invitation
      const { data: existingInvite } = await supabase
        .from("household_invites")
        .select()
        .eq("household_id", householdId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An invitation has already been sent to this email",
        });
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from("household_invites")
        .insert([{
          household_id: householdId,
          email,
          invited_by: user.id,
        }]);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            Send Invitation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}