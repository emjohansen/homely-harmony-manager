import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateHousehold = ({ onCreated }: { onCreated: (household: any) => void }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Ingen bruker funnet");

      // First create the household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (householdError) throw householdError;

      // Then add the creator as a member
      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: "admin"
        }]);

      if (memberError) throw memberError;

      toast({
        title: "Husholdning opprettet",
        description: "Din nye husholdning har blitt opprettet",
      });
      
      onCreated(household);
    } catch (error) {
      console.error("Error creating household:", error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke opprette husholdning. Vennligst prøv igjen.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Navn på husholdning
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Skriv inn navn på husholdning"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        Opprett husholdning
      </Button>
    </form>
  );
};

export default CreateHousehold;