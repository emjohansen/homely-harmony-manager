import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdRole } from "@/hooks/use-household-role";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DeleteHouseholdDialog } from "./household/DeleteHouseholdDialog";
import { MemberList } from "./household/MemberList";

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
      if (!isAdmin && memberId !== currentUserId) {
        throw new Error("Only admins can remove other members");
      }

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
      return memberId !== currentUserId;
    } else {
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
            <>
              <MemberList 
                members={members}
                canRemoveMember={canRemoveMember}
                onRemoveMember={handleRemoveMember}
              />
              {isAdmin && (
                <div className="pt-4 border-t border-mint/20 mt-4">
                  <DeleteHouseholdDialog 
                    household={{ id: householdId, name: "Current Household" }}
                    onDelete={onMemberRemoved}
                  />
                </div>
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};