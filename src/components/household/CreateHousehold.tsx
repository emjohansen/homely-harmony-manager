import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateHousehold = ({ onCreated }: { onCreated: () => void }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("households")
        .insert([{ name, created_by: user.id }]);

      if (error) throw error;

      toast({
        title: t('household.create'),
        description: t('household.createSuccess'),
      });
      
      onCreated();
    } catch (error) {
      console.error("Error creating household:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('household.createError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('household.name')}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('household.namePlaceholder')}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {t('household.create')}
      </Button>
    </form>
  );
};

export default CreateHousehold;