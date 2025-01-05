import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

interface Member {
  id: string;
  username: string | null;
  avatar_url: string | null;
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
            username,
            avatar_url
          )
        `)
        .eq("household_id", householdId);

      if (error) throw error;

      const formattedMembers = data.map((member: any) => ({
        id: member.user_id,
        username: member.profiles.username,
        avatar_url: member.profiles.avatar_url,
        role: member.role,
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
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

  const leaveHousehold = async () => {
    try {
      // Remove from household_members
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("household_id", householdId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      // Clear current_household in profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ current_household: null })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      // Clear localStorage
      localStorage.removeItem('currentHouseholdId');

      toast({
        title: "Success",
        description: "You have left the household",
      });

      if (onMembershipChange) {
        onMembershipChange();
      }
    } catch (error) {
      console.error("Error leaving household:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not leave household",
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
          <div
            key={member.id}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback>
                  {member.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.username}</p>
                <p className="text-sm text-gray-500 capitalize">{member.role}</p>
              </div>
            </div>
            {isAdmin && member.id !== currentUserId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMember(member.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {currentUserId && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={leaveHousehold}
        >
          Leave Household
        </Button>
      )}
    </div>
  );
}