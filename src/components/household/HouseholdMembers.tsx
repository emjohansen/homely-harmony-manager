import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserMinus } from "lucide-react";

interface Member {
  user_id: string;
  role: string;
  profiles: {
    username: string;
  };
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
    fetchMembers();
  }, [householdId]);

  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("household_members")
        .select(`
          user_id,
          role,
          profiles (username)
        `)
        .eq("household_id", householdId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
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

  const handleLeaveHousehold = async () => {
    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have left the household",
      });

      if (onMembershipChange) {
        onMembershipChange();
      }

      // Refresh the page to update the UI
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Members</h2>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div>
              <p className="font-medium">{member.profiles.username || "Unknown user"}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
            {isAdmin && member.user_id !== currentUserId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveMember(member.user_id)}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {!isAdmin && (
        <Button
          variant="destructive"
          onClick={handleLeaveHousehold}
          className="w-full"
        >
          Leave Household
        </Button>
      )}
    </div>
  );
}