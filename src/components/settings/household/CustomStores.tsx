import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CustomStores = () => {
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [newStore, setNewStore] = useState("");
  const { toast } = useToast();

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

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="stores">
        <AccordionTrigger>
          Custom Stores ({customStores.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <form onSubmit={addCustomStore} className="flex gap-2">
              <Input
                placeholder="Add new store..."
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="bg-sage hover:bg-sage/90">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="space-y-2">
              {customStores.map((store) => (
                <div key={store} className="flex items-center justify-between p-2 bg-mint rounded-lg">
                  <span>{store}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomStore(store)}
                    className="text-forest hover:text-forest/70"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};