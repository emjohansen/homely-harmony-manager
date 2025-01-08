import { useState, useEffect } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdRole } from "@/hooks/use-household-role";
import { DeleteHouseholdDialog } from "./household/DeleteHouseholdDialog";

interface Member {
  id: string;
  username: string | null;
  role: string;
}

interface HouseholdMembersProps {
  householdId: string;
  onMemberRemoved: () => void;
}

export const HouseholdMembers = ({ householdId, onMemberRemoved }: HouseholdMembersProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useHouseholdRole(householdId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (householdId) {
      fetchMembers();
    }
  }, [householdId]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching members for household:', householdId);

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          user_id,
          role,
          profiles:user_id (
            username
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('Supabase error fetching members:', error);
        throw error;
      }

      console.log('Fetched members data:', data);

      if (!data) {
        setMembers([]);
        return;
      }

      const formattedMembers = data.map(member => ({
        id: member.user_id,
        username: member.profiles?.username || 'Unknown User',
        role: member.role
      }));

      setMembers(formattedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load household members. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load household members. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // If user is not admin and trying to remove someone else
      if (!isAdmin && memberId !== currentUserId) {
        throw new Error("Only admins can remove other members");
      }

      // If user is admin trying to remove themselves
      if (isAdmin && memberId === currentUserId) {
        throw new Error("Admins cannot remove themselves");
      }

      console.log('Removing member:', memberId, 'from household:', householdId);
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Member removed successfully.",
      });

      onMemberRemoved();
      await fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canRemoveMember = (memberId: string) => {
    if (isAdmin) {
      // Admin can remove anyone except themselves
      return memberId !== currentUserId;
    } else {
      // Non-admin can only remove themselves
      return memberId === currentUserId;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="members">
        <AccordionTrigger>
          Household Members ({isLoading ? '...' : members.length})
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading members...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : members.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No members found</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-mint rounded-lg"
                >
                  <div>
                    <span className="font-medium">{member.username}</span>
                    <span className="ml-2 text-sm text-forest/70">({member.role})</span>
                  </div>
                  {canRemoveMember(member.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isAdmin && (
                <div className="pt-4 border-t border-mint/20 mt-4">
                  <DeleteHouseholdDialog 
                    household={{ id: householdId, name: "Current Household" }}
                    onDelete={onMemberRemoved}
                  />
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};