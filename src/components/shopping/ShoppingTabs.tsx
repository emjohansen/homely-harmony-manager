import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingLists } from "./ShoppingLists";

interface ShoppingTabsProps {
  currentHouseholdId: string | null;
  lists: any[];
  onListsChange: () => void;
}

export const ShoppingTabs = ({ currentHouseholdId, lists, onListsChange }: ShoppingTabsProps) => {
  return (
    <Tabs 
      defaultValue="active" 
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 overflow-visible bg-cream p-0 [&_[data-state=active]]:bg-sage [&_[data-state=active]]:text-cream [&_[data-state=active]]:border-sage [&_[data-state=active]]:border [&_[data-state=active]]:border-b [&_[data-state=inactive]]:border-sage [&_[data-state=inactive]]:border [&_[data-state=inactive]]:border-b">
        <TabsTrigger value="active" className="text-forest text-sm h-[42px]">Open Lists</TabsTrigger>
        <TabsTrigger value="archived" className="text-forest text-sm h-[42px]">Completed Lists</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="w-full">
        {!currentHouseholdId ? (
          <div className="text-center py-8 text-forest">
            Join a household to start adding your own shopping lists!
          </div>
        ) : lists.filter(list => list.status === 'active').length === 0 ? (
          <div className="text-center py-8 text-forest">
            No shopping lists yet. Add your first list!
          </div>
        ) : (
          <div className="mt-6">
            <ShoppingLists 
              lists={lists.filter(list => list.status === 'active')}
              onListsChange={onListsChange}
            />
          </div>
        )}
      </TabsContent>
      <TabsContent value="archived" className="w-full">
        {lists.filter(list => list.status === 'archived').length === 0 ? (
          <div className="text-center py-8 text-forest">
            No archived shopping lists.
          </div>
        ) : (
          <div className="mt-6">
            <ShoppingLists 
              lists={lists.filter(list => list.status === 'archived')}
              onListsChange={onListsChange}
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};