import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HouseholdDropdown } from "./HouseholdDropdown";
import { InviteMemberButton } from "./InviteMemberButton";
import { HouseholdMembers } from "./HouseholdMembers";

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
  const { toast } = useToast();
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log('Creating new household with name:', newHouseholdName);

      const { data: household, error: createError } = await supabase
        .from('households')
        .insert([{ name: newHouseholdName, created_by: user.id }])
        .select()
        .single();

      if (createError) throw createError;

      console.log('Created household:', household);

      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      setNewHouseholdName("");
      setIsDialogOpen(false);
      onHouseholdsChange();
      
      toast({
        title: "Success",
        description: "Household created successfully.",
      });
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: "Error",
        description: "Failed to create household. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              <InviteMemberButton householdId={currentHousehold.id} />
              <div className="mt-4">
                <HouseholdMembers 
                  householdId={currentHousehold.id}
                  onMemberRemoved={onHouseholdsChange}
                />
              </div>
            </>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Household
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cream">
            <DialogHeader>
              <DialogTitle>Create New Household</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="householdName">Household Name</Label>
                <Input
                  id="householdName"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  placeholder="Enter household name"
                />
              </div>
              <Button onClick={handleCreateHousehold} className="w-full">
                Create Household
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};