import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MemberListItem } from "./MemberListItem";
import { InviteMemberForm } from "./InviteMemberForm";
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMembersListProps } from "@/types/household";

interface Member {
  id: string;
  username: string | null;
  role: 'admin' | 'member';
}

export const HouseholdMembersList = ({ householdId, isAdmin }: HouseholdMembersListProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchMembers();
    getCurrentUser();
  }, [householdId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchMembers = async () => {
    try {
      // First get the household to get members and admins arrays
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('members, admins')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      if (household) {
        // Get all unique member IDs
        const memberIds = [...new Set([...(household.members || []), ...(household.admins || [])])];

        // Fetch profiles for all members
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', memberIds);

        if (profilesError) throw profilesError;

        // Map profiles to members with roles
        const membersList: Member[] = profiles?.map(profile => ({
          id: profile.id,
          username: profile.username,
          role: household.admins?.includes(profile.id) ? 'admin' : 'member'
        })) || [];

        setMembers(membersList);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const inviteMember = async (email: string) => {
    try {
      // First get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .single();

      if (profileError) {
        console.error('Error finding user:', profileError);
        return;
      }

      // Get current members array
      const { data: household, error: fetchError } = await supabase
        .from('households')
        .select('members')
        .eq('id', householdId)
        .single();

      if (fetchError) throw fetchError;

      // Add new member to array if not already present
      const currentMembers = household.members || [];
      if (!currentMembers.includes(profile.id)) {
        const { error: updateError } = await supabase
          .from('households')
          .update({
            members: [...currentMembers, profile.id]
          })
          .eq('id', householdId);

        if (updateError) throw updateError;
      }

      fetchMembers();
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { data: household, error: fetchError } = await supabase
        .from('households')
        .select('members, admins')
        .eq('id', householdId)
        .single();

      if (fetchError) throw fetchError;

      // Remove from both members and admins arrays
      const updatedMembers = (household.members || []).filter(id => id !== memberId);
      const updatedAdmins = (household.admins || []).filter(id => id !== memberId);

      const { error: updateError } = await supabase
        .from('households')
        .update({
          members: updatedMembers,
          admins: updatedAdmins
        })
        .eq('id', householdId);

      if (updateError) throw updateError;

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <InviteMemberForm onInvite={inviteMember} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <MemberListItem
            key={member.id}
            username={member.username || 'Unknown User'}
            role={member.role}
            showRemoveButton={isAdmin && member.id !== currentUserId}
            onRemove={() => removeMember(member.id)}
          />
        ))}
      </div>
    </div>
  );
};