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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [hasNickname, setHasNickname] = useState(true);
  const [hasHousehold, setHasHousehold] = useState(true);

  useEffect(() => {
    const checkUserSetup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, current_household')
        .eq('id', user.id)
        .single();

      if (profile) {
        setHasNickname(!!profile.username);
        setHasHousehold(!!profile.current_household);
        setShowSetupAlert(!profile.username || !profile.current_household);
      }
    };

    checkUserSetup();
  }, []);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#efffed]">
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
                <SelectContent className="bg-[#efffed]">
                  <SelectItem value="en">{t('settings.english')}</SelectItem>
                  <SelectItem value="no">{t('settings.norwegian')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSetupAlert} onOpenChange={setShowSetupAlert}>
        <AlertDialogContent className="bg-[#efffed]">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile Setup</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              To access all features, you need to:
              {!hasNickname && (
                <div className="flex items-center space-x-2">
                  <span className="text-[#1e251c]">• Set up a nickname</span>
                </div>
              )}
              {!hasHousehold && (
                <div className="flex items-center space-x-2">
                  <span className="text-[#1e251c]">• Join or create a household</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;