import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface HouseholdMember {
  user_id: string;
  role: string;
  profiles: {
    username: string | null;
  };
}

interface HouseholdMembersProps {
  householdId: string;
  isCreator: boolean;
  onMembershipChange: () => void;
}

const HouseholdMembers = ({ householdId, isCreator, onMembershipChange }: HouseholdMembersProps) => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          user_id,
          role,
          profiles (
            username
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      setMembers(data);
    };

    fetchMembers();
  }, [householdId]);

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from household",
      });

      onMembershipChange();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove member",
      });
    }
  };

  const handleLeaveHousehold = async () => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have left the household",
      });

      onMembershipChange();
    } catch (error) {
      console.error('Error leaving household:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not leave household",
      });
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Members</h4>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.user_id} className="flex justify-between items-center p-2 bg-cream rounded-lg">
            <span>{member.profiles.username || 'Unknown user'}</span>
            {isCreator && member.user_id !== currentUserId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveMember(member.user_id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      {!isCreator && (
        <Button
          variant="destructive"
          className="mt-4"
          onClick={handleLeaveHousehold}
        >
          Leave Household
        </Button>
      )}
    </div>
  );
};

export default HouseholdMembers;