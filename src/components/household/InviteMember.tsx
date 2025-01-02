import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InviteMember = ({ householdId }: { householdId: string }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("household_invites")
        .insert([{
          household_id: householdId,
          email,
          invited_by: user.id,
        }]);

      if (error) throw error;

      toast({
        title: t('household.inviteSuccess'),
        description: t('household.inviteSent'),
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('household.inviteError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('household.inviteEmail')}
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {t('household.sendInvite')}
      </Button>
    </form>
  );
};

export default InviteMember;