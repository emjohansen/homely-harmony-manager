import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomStoresManagement } from "./settings/CustomStoresManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Household {
  id: string;
  name: string;
  custom_stores?: string[];
}

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  useEffect(() => {
    fetchCurrentHousehold();
  }, []);

  const fetchCurrentHousehold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      if (profile?.current_household) {
        console.log('Fetching household with ID:', profile.current_household);
        const { data: household } = await supabase
          .from('households')
          .select('id, name, custom_stores')
          .eq('id', profile.current_household)
          .single();

        if (household) {
          console.log('Current household fetched:', household);
          setCurrentHousehold(household);
        }
      }
    } catch (error) {
      console.error('Error fetching current household:', error);
      toast.error("Failed to fetch household data");
    }
  };

  const onHouseholdsChange = async () => {
    console.log('Refreshing household data...');
    await fetchCurrentHousehold();
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.settings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('settings.language')}
            </label>
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
          </div>
          <CustomStoresManagement 
            currentHousehold={currentHousehold}
            onHouseholdsChange={onHouseholdsChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;