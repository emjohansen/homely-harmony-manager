import { useEffect, useState } from "react";
import { MemberCard } from "./MemberCard";
import { useHouseholdMembers } from "@/hooks/use-household-members";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  username?: string;
  role?: 'admin' | 'member';
}

interface MembersListProps {
  householdId: string;
  isAdmin: boolean;
}

export const MembersList = ({ householdId, isAdmin }: MembersListProps) => {
  const { members: rawMembers, isLoading, fetchMembers, removeMember } = useHouseholdMembers(householdId);
  const [membersWithRoles, setMembersWithRoles] = useState<Member[]>([]);

  useEffect(() => {
    if (householdId) {
      fetchMembers();
    }
  }, [householdId]);

  useEffect(() => {
    const fetchMemberRoles = async () => {
      if (!rawMembers.length) return;

      const { data: household } = await supabase
        .from('households')
        .select('admins')
        .eq('id', householdId)
        .single();

      const updatedMembers: Member[] = rawMembers.map(member => ({
        ...member,
        role: household?.admins?.includes(member.id) ? ('admin' as const) : ('member' as const)
      }));

      setMembersWithRoles(updatedMembers);
    };

    fetchMemberRoles();
  }, [rawMembers, householdId]);

  if (isLoading) {
    return <p className="text-gray-500">Loading members...</p>;
  }

  if (!membersWithRoles.length) {
    return <p className="text-gray-500">No members found</p>;
  }

  return (
    <div className="space-y-2">
      {membersWithRoles.map((member) => (
        <MemberCard
          key={member.id}
          username={member.username || 'Unknown User'}
          role={member.role || 'member'}
          showRemoveButton={isAdmin && member.id !== member.id}
          onRemove={() => removeMember(member.id)}
        />
      ))}
    </div>
  );
};