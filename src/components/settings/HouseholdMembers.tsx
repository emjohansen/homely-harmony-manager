import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useHouseholdRole } from "@/hooks/use-household-role";
import { MembersList } from "./household/MembersList";

interface Member {
  id: string;
  username: string;
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
  const { isAdmin } = useHouseholdRole(householdId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState<string>("");

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
      fetchHouseholdName();
    }
  }, [householdId]);

  const fetchHouseholdName = async () => {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('name')
        .eq('id', householdId)
        .single();

      if (error) throw error;
      if (data) {
        setHouseholdName(data.name);
      }
    } catch (error) {
      console.error('Error fetching household name:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching members for household:', householdId);

      const { data: memberData, error } = await supabase
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
        console.error('Error fetching members:', error);
        throw error;
      }

      console.log('Raw members data:', memberData);

      if (!memberData) {
        setMembers([]);
        return;
      }

      const formattedMembers = memberData.map(member => ({
        id: member.user_id,
        username: member.profiles?.username || 'Unknown User',
        role: member.role
      }));

      console.log('Formatted members:', formattedMembers);
      setMembers(formattedMembers);
    } catch (err) {
      console.error('Error in fetchMembers:', err);
      setError('Failed to load household members');
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

      if (error) throw error;

      onMemberRemoved();
      await fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      throw error;
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
            <MembersList
              members={members}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              householdId={householdId}
              householdName={householdName}
              onMemberRemoved={onMemberRemoved}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};