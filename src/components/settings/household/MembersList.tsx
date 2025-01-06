import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MemberListItem } from "./MemberListItem";
import { DeleteHouseholdDialog } from "./DeleteHouseholdDialog";
import { useNavigate } from "react-router-dom";

interface Member {
  id: string;
  username: string;
  role: string;
}

interface MembersListProps {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
  householdId: string;
  householdName: string;
  onMemberRemoved: () => void;
}

export const MembersList = ({
  members,
  isLoading,
  error,
  currentUserId,
  isAdmin,
  householdId,
  householdName,
  onMemberRemoved,
}: MembersListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

      toast({
        title: "Success",
        description: "Member removed successfully.",
      });

      // If user removed themselves, refresh the page
      if (memberId === currentUserId) {
        window.location.reload();
      } else {
        onMemberRemoved();
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading members...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (members.length === 0) {
    return <div className="text-center py-4 text-gray-500">No members found</div>;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberListItem
          key={member.id}
          member={member}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onRemove={handleRemoveMember}
        />
      ))}
      {isAdmin && (
        <div className="pt-4 border-t border-mint/20 mt-4">
          <DeleteHouseholdDialog 
            household={{ id: householdId, name: householdName }}
            onDelete={onMemberRemoved}
          />
        </div>
      )}
    </div>
  );
};