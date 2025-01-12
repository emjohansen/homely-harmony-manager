import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListHeader } from "@/components/shopping/ShoppingListHeader";
import { AddShoppingListItem } from "@/components/shopping/AddShoppingListItem";
import { ShoppingListItems } from "@/components/shopping/ShoppingListItems";
import { PageLogo } from "@/components/common/PageLogo";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const ShoppingListDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    console.log('ShoppingListDetail mounted with ID:', id);
    fetchList();
    fetchItems();
  }, [id]);

  const fetchList = async () => {
    console.log('Fetching list details for ID:', id);
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

    console.log('Successfully fetched list:', data);
    setList(data);
  };

  const fetchItems = async () => {
    console.log('Starting fetchItems for list ID:', id);
    
    // First get all items for this shopping list
    const { data: itemsData, error: itemsError } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('shopping_list_id', id)
      .order('added_at', { ascending: true });

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      toast({
        title: "Error",
        description: "Failed to fetch shopping list items",
        variant: "destructive",
      });
      return;
    }

    console.log('Successfully fetched items:', itemsData);

    // Then get usernames for all added_by users
    if (itemsData && itemsData.length > 0) {
      const userIds = itemsData.map(item => item.added_by).filter(Boolean);
      console.log('Fetching usernames for user IDs:', userIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      console.log('Successfully fetched profiles:', profilesData);

      // Create a map of user IDs to usernames
      const usernameMap = Object.fromEntries(
        profilesData?.map(profile => [profile.id, profile.username]) || []
      );

      // Combine items with usernames
      const itemsWithUsernames = itemsData.map(item => ({
        ...item,
        adder: {
          username: usernameMap[item.added_by] || 'Unknown'
        }
      }));

      console.log('Final items with usernames:', itemsWithUsernames);
      setItems(itemsWithUsernames);
    } else {
      console.log('No items found for this shopping list');
      setItems([]);
    }
  };

  const handleAddItem = async (item: string, quantity: string, store: string) => {
    console.log('Adding new item:', { item, quantity, store });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found when trying to add item');
      return;
    }

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

    console.log('Successfully added item, refreshing items list');
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
    <div className="relative min-h-screen bg-transparent pb-20">
      <PageLogo />
      <div className="relative z-0 max-w-4xl mx-auto px-4 py-4">
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