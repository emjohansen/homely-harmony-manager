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
import { Settings as SettingsIcon, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [newStore, setNewStore] = useState("");

  useEffect(() => {
    fetchCustomStores();
  }, []);

  const fetchCustomStores = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('custom_stores')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching custom stores:', error);
      return;
    }

    setCustomStores(data.custom_stores || []);
  };

  const addCustomStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedStores = [...customStores, newStore.trim()];
    const { error } = await supabase
      .from('profiles')
      .update({ custom_stores: updatedStores })
      .eq('id', user.id);

    if (error) {
      console.error('Error adding custom store:', error);
      toast({
        title: "Error",
        description: "Failed to add custom store",
        variant: "destructive",
      });
      return;
    }

    setCustomStores(updatedStores);
    setNewStore("");
    toast({
      title: "Success",
      description: "Custom store added successfully",
    });
  };

  const removeCustomStore = async (storeToRemove: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updatedStores = customStores.filter(store => store !== storeToRemove);
    const { error } = await supabase
      .from('profiles')
      .update({ custom_stores: updatedStores })
      .eq('id', user.id);

    if (error) {
      console.error('Error removing custom store:', error);
      toast({
        title: "Error",
        description: "Failed to remove custom store",
        variant: "destructive",
      });
      return;
    }

    setCustomStores(updatedStores);
    toast({
      title: "Success",
      description: "Custom store removed successfully",
    });
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Stores</label>
            <form onSubmit={addCustomStore} className="flex gap-2">
              <Input
                placeholder="Add new store..."
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-[#9dbc98] hover:bg-[#9dbc98]/90">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="space-y-2">
              {customStores.map((store) => (
                <div key={store} className="flex items-center justify-between bg-white p-2 rounded-md">
                  <span>{store}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomStore(store)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;