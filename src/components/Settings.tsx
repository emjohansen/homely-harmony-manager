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
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Loading data for user:", session.user.id);
          setEmail(session.user.email || "");
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              title: "Error",
              description: "Failed to load profile data",
              variant: "destructive",
            });
            return;
          }
            
          if (profile) {
            console.log("Profile loaded:", profile);
            setUsername(profile.username || "");
          } else {
            console.log("No profile found, creating one");
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id, 
                username: session.user.email?.split('@')[0] || 'User'
              }]);
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast({
                title: "Error",
                description: "Failed to create profile",
                variant: "destructive",
              });
              return;
            }
            
            setUsername(session.user.email?.split('@')[0] || 'User');
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    loadUserData();
  }, [toast]);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const updateUsername = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("No user session found");
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-forest">
              Email
            </label>
            <Input
              type="email"
              value={email}
              disabled
              className="bg-[#e0f0dd] text-forest"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-forest">
              Username
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#e0f0dd] text-forest"
                placeholder="Enter your username"
              />
              <Button 
                onClick={updateUsername}
                disabled={isLoading}
                className="bg-[#9dbc98] hover:bg-[#8baa88] text-[#1e251c]"
              >
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;