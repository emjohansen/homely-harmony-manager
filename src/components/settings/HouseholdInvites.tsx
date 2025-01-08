import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { House } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  } | null;
}

export const HouseholdInvites = () => {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Fetching invites for user email:', user.email);

      const { data, error } = await supabase
        .from('household_invites')
        .select(`
          id,
          household_id,
          households:household_id (
            name
          ),
          status,
          invited_by,
          profiles:invited_by (
            username
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invites:', error);
        throw error;
      }

      console.log('Fetched invites:', data);
      setPendingInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string, householdId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log('Accepting invite:', inviteId, 'for household:', householdId);

      // First check if user is already a member of this household
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError;
      }

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this household",
          variant: "default",
        });
        return;
      }

      // Update invite status
      const { error: updateError } = await supabase
        .from('household_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId)
        .eq('status', 'pending'); // Only update if still pending

      if (updateError) throw updateError;

      // Add user to household members
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdId,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        // If adding member fails, revert invite status
        await supabase
          .from('household_invites')
          .update({ status: 'pending' })
          .eq('id', inviteId);
        throw memberError;
      }

      toast({
        title: "Success",
        description: "Invitation accepted successfully",
      });

      // Refresh invites list
      fetchInvites();
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const handleDenyInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('household_invites')
        .update({ status: 'denied' })
        .eq('id', inviteId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation denied successfully",
      });

      // Refresh invites list
      fetchInvites();
    } catch (error: any) {
      console.error('Error denying invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deny invitation",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading invites...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Household Invites</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pending-invites">
          <AccordionTrigger className="flex items-center gap-2">
            <House className="h-5 w-5" />
            <span>Pending Invites ({pendingInvites.length})</span>
          </AccordionTrigger>
          <AccordionContent>
            {pendingInvites.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">No pending invites</p>
            ) : (
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <House className="h-5 w-5 text-sage" />
                      <div className="flex flex-col">
                        <span className="font-medium">{invite.households.name}</span>
                        <span className="text-sm text-gray-500">
                          Invited by {invite.profiles?.username || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(invite.id, invite.household_id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDenyInvite(invite.id)}
                      >
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};