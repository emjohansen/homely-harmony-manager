import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

interface Invite {
  id: string;
  household_id: string;
  households: {
    name: string;
  };
  inviter: {
    username: string;
  };
}

export default function HouseholdInvites() {
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("household_invites")
        .select(`
          id,
          household_id,
          households:household_id (name),
          inviter:invited_by (username)
        `)
        .eq("email", user.email)
        .eq("status", "pending");

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (inviteId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (accept) {
        const { data: invite } = await supabase
          .from("household_invites")
          .select("household_id")
          .eq("id", inviteId)
          .single();

        if (!invite) return;

        // Add user as member
        await supabase
          .from("household_members")
          .insert({
            household_id: invite.household_id,
            user_id: user.id,
            role: "member"
          });

        // Update current household
        await supabase
          .from("profiles")
          .update({ 
            current_household: invite.household_id,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
      }

      // Update invite status
      await supabase
        .from("household_invites")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", inviteId);

      toast({
        title: "Success",
        description: `Invitation ${accept ? "accepted" : "declined"}`,
      });

      fetchInvites();
    } catch (error) {
      console.error("Error handling invite:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process invitation",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (invites.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pending Invitations</h2>
      <div className="space-y-2">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
              <p className="font-medium">{invite.households.name}</p>
              <p className="text-sm text-gray-500">
                From: {invite.inviter?.username || "Unknown"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleInvite(invite.id, true)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInvite(invite.id, false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}