import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LanguageSettings = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-forest">
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
  );
};