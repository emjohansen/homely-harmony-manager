import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberListItem } from "./MemberListItem";
import { LeaveHouseholdDialog } from "./LeaveHouseholdDialog";

interface Member {
  id: string;
  username: string | null;
  role: string;
}

interface HouseholdMembersProps {
  householdId: string;
  isAdmin: boolean;
  onMembershipChange?: () => void;
}

export default function HouseholdMembers({ 
  householdId, 
  isAdmin,
  onMembershipChange 
}: HouseholdMembersProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();
    fetchMembers();
  }, [householdId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("household_members")
        .select(`
          user_id,
          role,
          profiles:user_id (
            username
          )
        `)
        .eq("household_id", householdId);

      if (error) throw error;

      const formattedMembers = data.map((member: any) => ({
        id: member.user_id,
        username: member.profiles.username,
        role: member.role,
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveHousehold = async () => {
    try {
      if (!currentUserId) return;

      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          current_household: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      localStorage.removeItem('currentHouseholdId');

      toast({
        title: "Success",
        description: "You have left the household",
      });

      if (onMembershipChange) {
        onMembershipChange();
      }

      window.location.reload();
    } catch (error) {
      console.error("Error leaving household:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not leave household",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from household",
      });

      fetchMembers();
      if (onMembershipChange) {
        onMembershipChange();
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove member",
      });
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members.map((member) => (
          <MemberListItem
            key={member.id}
            username={member.username}
            role={member.role}
            canDelete={isAdmin && member.id !== currentUserId}
            onDelete={() => removeMember(member.id)}
          />
        ))}
      </div>

      {currentUserId && (
        <LeaveHouseholdDialog onLeave={leaveHousehold} />
      )}
    </div>
  );
}