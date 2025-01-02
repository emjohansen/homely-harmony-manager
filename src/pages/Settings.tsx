import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Språk</CardTitle>
            <CardDescription>Velg ditt foretrukne språk</CardDescription>
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
                <SelectItem value="en">Engelsk</SelectItem>
                <SelectItem value="no">Norsk</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Settings;