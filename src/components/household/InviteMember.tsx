import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InviteMember = ({ householdId }: { householdId: string }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if there's already a pending invitation
      const { data: existingInvite, error: fetchError } = await supabase
        .from("household_invites")
        .select()
        .eq("household_id", householdId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing invites:", fetchError);
        throw new Error("Failed to check existing invitations");
      }

      if (existingInvite) {
        toast({
          variant: "destructive",
          title: "Invitation exists",
          description: "An invitation has already been sent to this email address",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: insertError } = await supabase
        .from("household_invites")
        .insert([{
          household_id: householdId,
          email,
          invited_by: user.id,
        }]);

      if (insertError) {
        console.error("Error creating invitation:", insertError);
        throw insertError;
      }

      toast({
        title: "Invitation sent",
        description: "An invitation has been sent to the provided email address",
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send invitation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Email address to invite
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="bg-cream"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-sage hover:bg-sage/90 text-forest"
      >
        Send Invitation
      </Button>
    </form>
  );
};

export default InviteMember;