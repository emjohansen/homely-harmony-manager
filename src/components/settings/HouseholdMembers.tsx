import { useState, useEffect } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  username: string;
  role: string;
}

interface HouseholdMembersProps {
  householdId: string | null;
  onMemberRemoved: () => void;
}

export const HouseholdMembers = ({ householdId, onMemberRemoved }: HouseholdMembersProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (householdId) {
      fetchMembers();
    }
  }, [householdId]);

  const fetchMembers = async () => {
    if (!householdId) return;

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
      console.error('Error fetching members:', error);
      return;
    }

    const formattedMembers = data.map(member => ({
      id: member.user_id,
      username: member.profiles.username,
      role: member.role
    }));

    setMembers(formattedMembers);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
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

      onMemberRemoved();
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!householdId) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="members">
        <AccordionTrigger>Household Members ({members.length})</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 bg-mint rounded-lg"
              >
                <div>
                  <span className="font-medium">{member.username}</span>
                  <span className="ml-2 text-sm text-forest/70">({member.role})</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};