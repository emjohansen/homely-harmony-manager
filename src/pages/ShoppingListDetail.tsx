import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingListItem } from "@/components/shopping/ShoppingListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Receipt, Store } from "lucide-react";
import Navigation from "@/components/Navigation";

const ShoppingListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [list, setList] = useState<any>(null);
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");

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

    console.log('Fetched list:', data);
    setList(data);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select(`
        *,
        adder:profiles!shopping_list_items_added_by_fkey (username)
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('shopping_list_items')
      .insert({
        shopping_list_id: id,
        item: newItem,
        quantity: newQuantity ? parseFloat(newQuantity) : null,
        unit: newUnit || null,
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

    setNewItem("");
    setNewQuantity("");
    setNewUnit("");
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
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/shopping')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lists
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{list?.name}</h1>
            <p className="text-sm text-gray-500">
              Created by {list?.creator?.username || 'Unknown'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Add Receipt
            </Button>
            {totalPrice > 0 && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                Total: {totalPrice} kr
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <Input
            placeholder="Add new item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="w-24"
          />
          <Input
            placeholder="Unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="w-24"
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </form>

        <div className="space-y-2">
          {items.map((item) => (
            <ShoppingListItem
              key={item.id}
              item={item}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
              onUpdateStore={handleUpdateStore}
              onUpdatePrice={handleUpdatePrice}
            />
          ))}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default ShoppingListDetail;