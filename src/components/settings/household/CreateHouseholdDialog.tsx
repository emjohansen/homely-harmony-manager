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
  const { toast } = useToast();

  const handleCreate = async () => {
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
      setIsOpen(false);
      onHouseholdCreated();
      
      toast({
        title: "Success",
        description: "Household created successfully.",
      });

      // Refresh the page
      window.location.reload();
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
            />
          </div>
          <Button onClick={handleCreate} className="w-full">
            Create Household
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};