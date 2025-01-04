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
        <Button className="bg-sage hover:bg-sage/90">
          <Plus className="h-4 w-4 mr-2" />
          New List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Shopping List Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="w-full bg-sage hover:bg-sage/90">
            Create List
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};