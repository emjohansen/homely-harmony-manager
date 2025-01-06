import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCustomStores } from "./useCustomStores";

export const CustomStores = () => {
  const [newStore, setNewStore] = useState("");
  const { customStores, isLoading, addCustomStore, removeCustomStore } = useCustomStores();

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await addCustomStore(newStore)) {
      setNewStore("");
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="stores" className="border-[#9dbc98]">
        <AccordionTrigger>
          Custom Stores ({customStores.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <form onSubmit={handleAddStore} className="flex gap-2">
              <Input
                placeholder="Add new store..."
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="bg-[#9dbc98] hover:bg-[#9dbc98]/90"
                disabled={isLoading || !newStore.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="space-y-2">
              {customStores.map((store) => (
                <div key={store} className="flex items-center justify-between p-2 bg-[#e0f0dd] rounded-lg">
                  <span className="text-[#1e251c]">{store}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomStore(store)}
                    className="text-[#1e251c] hover:text-[#1e251c]/70"
                    disabled={isLoading}
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