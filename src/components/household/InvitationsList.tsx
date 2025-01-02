import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Invitation {
  id: string;
  household_id: string;
  email: string;
  status: string;
  created_at: string;
}

const InvitationsList = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    const fetchInvitations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("household_invites")
        .select("*")
        .eq("email", user.email)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching invitations:", error);
        return;
      }

      setInvitations(data);
    };

    fetchInvitations();
  }, []);

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Ingen bruker funnet");

      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      if (accept) {
        const { error: memberError } = await supabase
          .from("household_members")
          .insert([{
            household_id: invitation.household_id,
            user_id: user.id,
            role: "member"
          }]);

        if (memberError) throw memberError;
      }

      const { error: inviteError } = await supabase
        .from("household_invites")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", invitationId);

      if (inviteError) throw inviteError;

      setInvitations(invitations.filter(inv => inv.id !== invitationId));

      toast({
        title: accept ? "Invitasjon akseptert" : "Invitasjon avslått",
        description: accept ? "Du har blitt med i husholdningen" : "Du avslo invitasjonen",
      });
    } catch (error) {
      console.error("Error handling invitation:", error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke håndtere invitasjonen. Vennligst prøv igjen.",
      });
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Ventende invitasjoner</h3>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
            <span>Du har mottatt en invitasjon til en husholdning</span>
            <div className="space-x-2">
              <Button
                variant="default"
                onClick={() => handleInvitation(invitation.id, true)}
              >
                Aksepter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleInvitation(invitation.id, false)}
              >
                Avslå
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitationsList;