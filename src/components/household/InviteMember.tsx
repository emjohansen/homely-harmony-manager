import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InviteMember = ({ householdId }: { householdId: string }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Ingen bruker funnet");

      const { error } = await supabase
        .from("household_invites")
        .insert([{
          household_id: householdId,
          email,
          invited_by: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Invitasjon sendt",
        description: "En invitasjon har blitt sendt til den angitte e-postadressen",
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke sende invitasjon. Vennligst prøv igjen.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          E-post til den du vil invitere
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="epost@eksempel.no"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        Send invitasjon
      </Button>
    </form>
  );
};

export default InviteMember;