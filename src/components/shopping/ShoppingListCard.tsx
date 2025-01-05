import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ShoppingListActions } from "./ShoppingListActions";

interface ShoppingListCardProps {
  list: {
    id: string;
    name: string;
    status: string;
    created_at: string;
    created_by: string;
    archived_at: string | null;
    creator?: {
      username: string | null;
    };
  };
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onViewList: (id: string) => void;
}

export const ShoppingListCard = ({ list, onArchive, onDelete, onViewList }: ShoppingListCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(list.id);
      toast({
        title: "Shopping list deleted",
        description: "The shopping list has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shopping list",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Card 
      className="border border-sage p-4 space-y-4 cursor-pointer hover:bg-mint/10 transition-colors"
      onClick={() => onViewList(list.id)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-forest">{list.name}</h3>
          <div className="space-y-1">
            <div>
              <p className="text-sm text-forest/80">Created by {list.creator?.username || "Unknown"}</p>
              <p className="text-xs text-forest/60">({formatDate(list.created_at)})</p>
            </div>
            {list.status === "archived" && list.archived_at && (
              <div>
                <p className="text-sm text-forest/80">Archived</p>
                <p className="text-xs text-forest/60">({formatDate(list.archived_at)})</p>
              </div>
            )}
          </div>
        </div>
        <ShoppingListActions 
          status={list.status}
          onArchive={() => onArchive(list.id)}
          onDelete={handleDelete}
        />
      </div>
    </Card>
  );
};