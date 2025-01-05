import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function CreateHouseholdDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Create household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (householdError) throw householdError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: "admin"
        }]);

      if (memberError) throw memberError;

      // Update user's current household
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          current_household: household.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Household created successfully",
      });
      
      setOpen(false);
      setName("");
      
      // Refresh the page to reset all states
      window.location.reload();
    } catch (error) {
      console.error("Error creating household:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create household",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Household
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Household</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Household name"
            required
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            Create Household
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}