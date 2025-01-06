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

interface CreateHouseholdDialogProps {
  onHouseholdCreated: () => void;
}

export const CreateHouseholdDialog = ({ onHouseholdCreated }: CreateHouseholdDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newHouseholdName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a household name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      console.log('Creating new household with name:', newHouseholdName);

      // Create the household
      const { data: household, error: createError } = await supabase
        .from('households')
        .insert([{ name: newHouseholdName, created_by: user.id }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating household:', createError);
        throw createError;
      }

      console.log('Created household:', household);

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) {
        console.error('Error adding member:', memberError);
        throw memberError;
      }

      // Update user's current household
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating current household:', updateError);
        throw updateError;
      }

      setNewHouseholdName("");
      setIsOpen(false);
      onHouseholdCreated();
      
      toast({
        title: "Success",
        description: "Household created successfully.",
      });

      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error in household creation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Household
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#efffed]">
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
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Household"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};