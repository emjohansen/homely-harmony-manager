import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewShoppingListProps {
  onCreateList: (name: string) => Promise<void>;
}

export const NewShoppingList = ({ onCreateList }: NewShoppingListProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the shopping list",
        variant: "destructive",
      });
      return;
    }

    try {
      await onCreateList(name);
      setName("");
      setOpen(false);
      toast({
        title: "Success",
        description: "Shopping list created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-[5%] right-[-2rem] w-32 h-32 rounded-full bg-sage hover:bg-mint transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center border-none"
          size="icon"
        >
          <p className="font-bold text-[95px] text-cream group-hover:text-forest leading-none flex items-center justify-center translate-y-[-1.5rem] translate-x-[-0.625rem]">+</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-cream border-sage">
        <DialogHeader>
          <DialogTitle className="text-forest">Create New Shopping List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Shopping List Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-mint border-sage text-forest placeholder:text-forest/50"
          />
          <Button type="submit" className="w-full bg-sage hover:bg-sage/90 text-cream">
            Create List
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};