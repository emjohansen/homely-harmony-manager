import { HouseholdDropdown } from "./HouseholdDropdown";
import { InviteMemberButton } from "./InviteMemberButton";
import { useHouseholdRole } from "@/hooks/use-household-role";
import { CreateHouseholdDialog } from "./household/CreateHouseholdDialog";
import { Label } from "@/components/ui/label";
import { CustomStores } from "./household/CustomStores";

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

export const HouseholdManagement = ({
  households,
  currentHousehold,
  onHouseholdSelect,
  onHouseholdsChange,
}: HouseholdManagementProps) => {
  const { isAdmin } = useHouseholdRole(currentHousehold?.id || null);

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