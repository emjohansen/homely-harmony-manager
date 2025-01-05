import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingListCard } from "./ShoppingListCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShoppingList {
  id: string;
  name: string;
  status: string;
  created_at: string;
  created_by: string;
  archived_at: string | null;
  archived_by?: string | null;
  creator?: {
    username: string | null;
  };
  archiver?: {
    username: string | null;
  };
}

interface ShoppingListsProps {
  lists: ShoppingList[];
  onListsChange: () => void;
}

export const ShoppingLists = ({ lists, onListsChange }: ShoppingListsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleArchiveList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archived_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      onListsChange();
      
      toast({
        title: "List archived",
        description: "The shopping list has been archived successfully."
      });
    } catch (error) {
      console.error('Error archiving list:', error);
      toast({
        title: "Error",
        description: "Failed to archive shopping list",
        variant: "destructive",
      });
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onListsChange();
      
      toast({
        title: "List deleted",
        description: "The shopping list has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "Failed to delete shopping list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {lists.map(list => (
        <ShoppingListCard
          key={list.id}
          list={list}
          onArchive={handleArchiveList}
          onDelete={handleDeleteList}
          onViewList={(id) => navigate(`/shopping/list/${id}`)}
        />
      ))}
    </div>
  );
};