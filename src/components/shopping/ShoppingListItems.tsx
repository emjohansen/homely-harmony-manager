import { ShoppingListItem } from "./ShoppingListItem";

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
  // Group items by store and checked status
  const groupAndSortItems = () => {
    // First, separate checked and unchecked items
    const uncheckedItems = items.filter(item => !item.is_checked);
    const checkedItems = items.filter(item => item.is_checked);

    // Group unchecked items by store
    const uncheckedGrouped = uncheckedItems.reduce<GroupedItems>((groups, item) => {
      const store = item.store || 'Any Store';
      if (!groups[store]) {
        groups[store] = [];
      }
      groups[store].push(item);
      return groups;
    }, {});

    // Move 'Any Store' to the beginning
    const sortedGroups: GroupedItems = {};
    if (uncheckedGrouped['Any Store']) {
      sortedGroups['Any Store'] = uncheckedGrouped['Any Store'];
      delete uncheckedGrouped['Any Store'];
    }

    // Add other store groups
    Object.keys(uncheckedGrouped)
      .sort()
      .forEach(store => {
        sortedGroups[store] = uncheckedGrouped[store];
      });

    return { sortedGroups, checkedItems };
  };

  const { sortedGroups, checkedItems } = groupAndSortItems();

  return (
    <div className="space-y-6">
      {/* Render unchecked items grouped by store */}
      {Object.entries(sortedGroups).map(([store, storeItems]) => (
        <div key={store} className="space-y-2">
          <h3 className="text-sm font-medium text-forest/80 pl-2">
            {store}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {storeItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={{
                  ...item,
                  added_by: item.adder?.username || 'Unknown',
                }}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateStore={onUpdateStore}
                onUpdatePrice={onUpdatePrice}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Render checked items */}
      {checkedItems.length > 0 && (
        <div className="space-y-2 opacity-60">
          <h3 className="text-sm font-medium text-forest/80 pl-2">
            Completed Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checkedItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={{
                  ...item,
                  added_by: item.adder?.username || 'Unknown',
                }}
                onToggle={onToggle}
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