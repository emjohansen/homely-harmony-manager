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
  onHouseholdsChange: () => void;
}

export const CreateHouseholdDialog = ({ onHouseholdsChange }: CreateHouseholdDialogProps) => {
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
      console.log('Creating new household with name:', newHouseholdName);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create the household
      const { data: household, error: createError } = await supabase
        .from('households')
        .insert([{ 
          name: newHouseholdName.trim(), 
          created_by: user.id 
        }])
        .select()
        .single();

      if (createError) throw createError;

      console.log('Created household:', household);

      // Update user's profile to set this as their current household
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_household: household.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setNewHouseholdName("");
      setIsOpen(false);
      onHouseholdsChange();
      
      toast({
        title: "Success",
        description: "Household created successfully",
      });
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: "Error",
        description: "Failed to create household. Please try again.",
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
