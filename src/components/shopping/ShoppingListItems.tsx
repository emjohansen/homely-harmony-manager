import { ShoppingListItem } from "./ShoppingListItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface GroupedItems {
  [key: string]: any[];
}

interface ShoppingListItemsProps {
  items: any[];
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onUpdateStore: (id: string, store: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
}

export const ShoppingListItems = ({
  items,
  onToggle,
  onDelete,
  onUpdateStore,
  onUpdatePrice,
}: ShoppingListItemsProps) => {
  const navigate = useNavigate();

  // Verify session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('Session verification error:', error);
        toast.error("Session expired. Please login again.");
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  // Group items by store and checked status
  const groupAndSortItems = () => {
    // First, separate checked and unchecked items
    const uncheckedItems = items.filter(item => !item.is_checked);
    const checkedItems = items.filter(item => item.is_checked);

    // Group unchecked items by store
    const groups: GroupedItems = {};
    uncheckedItems.forEach(item => {
      const store = item.store || 'Unspecified';
      if (!groups[store]) {
        groups[store] = [];
      }
      groups[store].push(item);
    });

    // Sort stores alphabetically
    const sortedGroups: GroupedItems = {};
    Object.keys(groups)
      .sort((a, b) => a.localeCompare(b))
      .forEach(store => {
        sortedGroups[store] = groups[store];
      });

    return { sortedGroups, checkedItems };
  };

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      // Get a fresh session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error("Session expired. Please login again.");
        navigate("/");
        return;
      }

      // Attempt to update with fresh session
      const { error: updateError } = await supabase
        .from('shopping_list_items')
        .update({ 
          is_checked: checked,
          // Add a timestamp to force a refresh
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating item:', updateError);
        if (updateError.message.includes('JWT')) {
          toast.error("Session expired. Please login again");
          navigate("/");
          return;
        }
        toast.error("Failed to update item");
        return;
      }

      // Only call the callback if the update was successful
      onToggle(id, checked);
      
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const { sortedGroups, checkedItems } = groupAndSortItems();

  return (
    <div className="space-y-8">
      {/* Unchecked items grouped by store */}
      <div className="space-y-6">
        {Object.entries(sortedGroups).map(([store, storeItems]) => (
          <div key={store} className="space-y-2">
            <h3 className="font-semibold text-gray-700">{store}</h3>
            <div className="space-y-2">
              {storeItems.map((item: any) => (
                <ShoppingListItem
                  key={item.id}
                  item={{
                    ...item,
                    added_by: item.adder?.username || 'Unknown',
                  }}
                  onToggle={handleToggle}
                  onDelete={onDelete}
                  onUpdateStore={onUpdateStore}
                  onUpdatePrice={onUpdatePrice}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Checked items */}
      {checkedItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Purchased Items</h3>
          <div className="space-y-2">
            {checkedItems.map((item: any) => (
              <ShoppingListItem
                key={item.id}
                item={{
                  ...item,
                  added_by: item.adder?.username || 'Unknown',
                }}
                onToggle={handleToggle}
                onDelete={onDelete}
                onUpdateStore={onUpdateStore}
                onUpdatePrice={onUpdatePrice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};