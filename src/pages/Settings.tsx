import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CreateHousehold from "@/components/household/CreateHousehold";
import InviteMember from "@/components/household/InviteMember";
import InvitationsList from "@/components/household/InvitationsList";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [household, setHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData, error: memberError } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .single();

        if (memberError && memberError.code !== "PGRST116") {
          console.error("Error fetching household membership:", memberError);
          return;
        }

        if (memberData) {
          const { data: householdData, error: householdError } = await supabase
            .from("households")
            .select("*")
            .eq("id", memberData.household_id)
            .single();

          if (householdError) {
            console.error("Error fetching household:", householdError);
            return;
          }

          setHousehold(householdData);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, []);

  const handleHouseholdCreated = () => {
    toast({
      title: t('household.createSuccess'),
      description: t('household.createSuccessMessage'),
    });
    // Refresh the household data
    window.location.reload();
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
          <CardDescription>{t('settings.languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={i18n.language}
            onValueChange={changeLanguage}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('settings.english')}</SelectItem>
              <SelectItem value="no">{t('settings.norwegian')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <InvitationsList />

      {!loading && (
        <>
          {!household ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('household.createNew')}</CardTitle>
                <CardDescription>{t('household.createDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateHousehold onCreated={handleHouseholdCreated} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{household.name}</CardTitle>
                <CardDescription>{t('household.manageMembers')}</CardDescription>
              </CardHeader>
              <CardContent>
                <InviteMember householdId={household.id} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;