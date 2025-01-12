import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem } from "@/components/shopping/ShoppingListItem";
import { ShoppingListHeader } from "@/components/shopping/ShoppingListHeader";
import { AddShoppingListItem } from "@/components/shopping/AddShoppingListItem";
import { ShoppingListItems } from "@/components/shopping/ShoppingListItems";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const ShoppingListDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    fetchList();
    fetchItems();
  }, [id]);

  const fetchList = async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        creator:profiles!shopping_lists_created_by_fkey (username)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching list:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shopping list",
        variant: "destructive",
      });
      return;
    }

    setList(data);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select(`
        *,
        adder:added_by (
          profiles (username)
        )
      `)
      .eq('shopping_list_id', id)
      .order('added_at', { ascending: true });

    if (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shopping list items",
        variant: "destructive",
      });
      return;
    }

    console.log('Fetched items:', data);
    setItems(data);
  };

  const handleAddItem = async (item: string, quantity: string, store: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .insert({
        shopping_list_id: id,
        item,
        quantity: quantity ? parseFloat(quantity) : null,
        store,
        added_by: user.id,
      });

    if (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
      return;
    }

    fetchItems();
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ is_checked: checked })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return;
    }

    fetchItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
      return;
    }

    fetchItems();
  };

  const handleUpdateStore = async (itemId: string, store: string) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ store })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating store:', error);
      toast({
        title: "Error",
        description: "Failed to update store",
        variant: "destructive",
      });
      return;
    }

    fetchItems();
  };

  const handleUpdatePrice = async (itemId: string, price: number) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ price })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
      return;
    }

    fetchItems();
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ShoppingListHeader list={list} totalPrice={totalPrice} />
        
        <AddShoppingListItem onAddItem={handleAddItem} />

        <ShoppingListItems
          items={items}
          onToggle={handleToggleItem}
          onDelete={handleDeleteItem}
          onUpdateStore={handleUpdateStore}
          onUpdatePrice={handleUpdatePrice}
        />
      </div>

      <Navigation />
    </div>
  );
};

export default ShoppingListDetail;