import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileSettings } from "./settings/ProfileSettings";
import { LanguageSettings } from "./settings/LanguageSettings";

const Settings = () => {
  const { t } = useTranslation();

  return (
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
          <LanguageSettings />
          <ProfileSettings />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;