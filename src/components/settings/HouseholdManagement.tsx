import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HouseholdDropdown } from "./HouseholdDropdown";
import { InviteMemberButton } from "./InviteMemberButton";
import { HouseholdMembers } from "./HouseholdMembers";
import { useHouseholdRole } from "@/hooks/use-household-role";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { isAdmin } = useHouseholdRole(currentHousehold?.id || null);

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

  const handleDeleteHousehold = async () => {
    if (!currentHousehold || deleteConfirmation !== currentHousehold.name) {
      toast({
        title: "Error",
        description: "Please type the exact household name to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('households')
        .delete()
        .eq('id', currentHousehold.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
      onHouseholdsChange();
      
      toast({
        title: "Success",
        description: "Household deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting household:', error);
      toast({
        title: "Error",
        description: "Failed to delete household. Please try again.",
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
              <div className="flex gap-2 mt-2">
                <InviteMemberButton householdId={currentHousehold.id} />
                {isAdmin && (
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Household
                  </Button>
                )}
              </div>
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Household</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p className="text-red-600 font-medium">
                  Warning: This action cannot be undone. All data associated with this household will be permanently deleted, including:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All recipes</li>
                  <li>Shopping lists</li>
                  <li>Chores and reminders</li>
                  <li>Storage items</li>
                  <li>Member associations</li>
                </ul>
                <p>
                  To confirm, please type the household name:
                  <span className="font-medium"> {currentHousehold?.name}</span>
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type household name to confirm"
                  className="mt-2"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteHousehold}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Household
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};