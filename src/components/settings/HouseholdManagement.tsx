import { HouseholdDropdown } from "./HouseholdDropdown";
import { InviteMemberButton } from "./InviteMemberButton";
import { useHouseholdRole } from "@/hooks/use-household-role";
import { CreateHouseholdDialog } from "./household/CreateHouseholdDialog";
import { Label } from "@/components/ui/label";
import { CustomStores } from "./household/CustomStores";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Household {
  id: string;
  name: string;
}

interface HouseholdManagementProps {
  households: Household[];
  currentHousehold: Household | null;
  onHouseholdSelect: (household: Household) => Promise<void>;
  onHouseholdsChange: () => void;
}

interface HouseholdMember {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  role: string;
}

export const HouseholdManagement = ({
  households,
  currentHousehold,
  onHouseholdSelect,
  onHouseholdsChange,
}: HouseholdManagementProps) => {
  const { isAdmin } = useHouseholdRole(currentHousehold?.id || null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['household-members', currentHousehold?.id],
    queryFn: async () => {
      if (!currentHousehold?.id) return [];
      
      console.log('Fetching members for household:', currentHousehold.id);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          role,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('household_id', currentHousehold.id);

      if (error) {
        console.error('Error fetching household members:', error);
        throw error;
      }

      console.log('Fetched members:', data);
      return data as HouseholdMember[];
    },
    enabled: !!currentHousehold?.id,
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Household Management</h2>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Active Household
          </Label>
          <HouseholdDropdown
            households={households}
            currentHousehold={currentHousehold}
            onHouseholdSelect={onHouseholdSelect}
          />
          {currentHousehold && (
            <>
              <div className="flex gap-2 mt-2">
                <InviteMemberButton householdId={currentHousehold.id} />
              </div>
              <div className="mt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="members">
                    <AccordionTrigger className="text-[#1e251c] hover:text-[#1e251c]/80">
                      Household Members
                    </AccordionTrigger>
                    <AccordionContent className="bg-[#e0f0dd] rounded-md p-4">
                      {isLoading ? (
                        <p className="text-sm text-[#1e251c]/70">Loading members...</p>
                      ) : members && members.length > 0 ? (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div 
                              key={member.profiles.id}
                              className="flex items-center justify-between bg-[#efffed] p-2 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profiles.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {member.profiles.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-[#1e251c]">
                                  {member.profiles.username || 'Anonymous'}
                                </span>
                              </div>
                              <span className="text-xs bg-[#9dbc98] text-[#1e251c] px-2 py-1 rounded-full">
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#1e251c]/70">No members found</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <CustomStores />
              </div>
            </>
          )}
        </div>

        <CreateHouseholdDialog onHouseholdCreated={onHouseholdsChange} />
      </div>
    </div>
  );
};