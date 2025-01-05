import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteHouseholdDialogProps {
  household: { id: string; name: string } | null;
  onDelete: () => void;
}

export const DeleteHouseholdDialog = ({ household, onDelete }: DeleteHouseholdDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!household || deleteConfirmation !== household.name) {
      toast({
        title: "Error",
        description: "Please type the exact household name to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('households')
        .delete()
        .eq('id', household.id);

      if (error) throw error;

      setIsOpen(false);
      setDeleteConfirmation("");
      onDelete();
      
      toast({
        title: "Success",
        description: "Household deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting household:', error);
      toast({
        title: "Error",
        description: "Failed to delete household. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Household
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-cream">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-red-600 font-medium">
                Warning: This action cannot be undone. All data associated with this household will be permanently deleted, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All recipes</li>
                <li>Shopping lists</li>
                <li>Chores and reminders</li>
                <li>Storage items</li>
                <li>Member associations</li>
              </ul>
              <p>
                To confirm, please type the household name:
                <span className="font-medium"> {household?.name}</span>
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type household name to confirm"
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Household
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};