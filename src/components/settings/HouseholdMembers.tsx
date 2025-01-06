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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
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
        .maybeSingle();

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

      // First fetch the household members
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select('user_id, role')
        .eq('household_id', householdId);

      if (membersError) throw membersError;

      if (!membersData) {
        setMembers([]);
        return;
      }

      // Then fetch the profiles for these members
      const userIds = membersData.map(member => member.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const formattedMembers = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          id: member.user_id,
          username: profile?.username || 'Unknown User',
          role: member.role
        };
      });

      setMembers(formattedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load household members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="members">
        <AccordionTrigger>
          Household Members ({isLoading ? '...' : members.length})
        </AccordionTrigger>
        <AccordionContent>
          <MembersList
            members={members}
            isLoading={isLoading}
            error={error}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            householdId={householdId}
            householdName={householdName}
            onMemberRemoved={onMemberRemoved}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};