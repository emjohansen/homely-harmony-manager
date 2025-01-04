import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewShoppingList } from "@/components/shopping/NewShoppingList";
import { ShoppingListCard } from "@/components/shopping/ShoppingListCard";

const Shopping = () => {
  const [lists, setLists] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentHousehold = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (householdMember) {
        setCurrentHouseholdId(householdMember.household_id);
        fetchShoppingLists(householdMember.household_id);
      }
    };

    fetchCurrentHousehold();
  }, []);

  const fetchShoppingLists = async (householdId: string) => {
    try {
      console.log('Fetching shopping lists for household:', householdId);
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          creator:profiles!shopping_lists_created_by_fkey (username)
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log('Fetched shopping lists:', data);
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shopping lists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (name: string) => {
    if (!currentHouseholdId) {
      toast({
        title: "Error",
        description: "You must be part of a household to create a shopping list",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('shopping_lists')
      .insert({
        name,
        household_id: currentHouseholdId,
        created_by: user.id,
        status: 'active'
      });

    if (error) throw error;
    fetchShoppingLists(currentHouseholdId);
  };

  const handleArchiveList = async (id: string) => {
    const { error } = await supabase
      .from('shopping_lists')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    fetchShoppingLists(currentHouseholdId!);
  };

  const handleViewList = (id: string) => {
    console.log('Opening shopping list:', id);
    navigate(`/shopping/list/${id}`);
  };

  const handleDeleteList = async (id: string) => {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    fetchShoppingLists(currentHouseholdId!);
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div 
        className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/7e24e64e-7cc7-4287-8a2e-41e46382fd65.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <ShoppingCart className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-5xl font-bold mb-4 text-cream uppercase tracking-wider">SHOPPING</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-forest">Loading shopping lists...</div>
        ) : (
          <Tabs 
            defaultValue="active" 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 overflow-visible bg-cream p-0 [&_[data-state=active]]:bg-sage [&_[data-state=active]]:text-cream [&_[data-state=active]]:border-sage [&_[data-state=active]]:border [&_[data-state=active]]:border-b [&_[data-state=inactive]]:bg-mint [&_[data-state=inactive]]:border-sage [&_[data-state=inactive]]:border [&_[data-state=inactive]]:border-b">
              <TabsTrigger value="active" className="text-forest text-sm h-[42px]">My Lists</TabsTrigger>
              <TabsTrigger value="archived" className="text-forest text-sm h-[42px]">Archived</TabsTrigger>
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
                <div className="space-y-4 mt-6">
                  {lists
                    .filter(list => list.status === 'active')
                    .map(list => (
                      <ShoppingListCard
                        key={list.id}
                        list={list}
                        onArchive={handleArchiveList}
                        onDelete={handleDeleteList}
                        onViewList={handleViewList}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="archived" className="w-full">
              {lists.filter(list => list.status === 'archived').length === 0 ? (
                <div className="text-center py-8 text-forest">
                  No archived shopping lists.
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {lists
                    .filter(list => list.status === 'archived')
                    .map(list => (
                      <ShoppingListCard
                        key={list.id}
                        list={list}
                        onArchive={handleArchiveList}
                        onDelete={handleDeleteList}
                        onViewList={handleViewList}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <NewShoppingList onCreateList={handleCreateList} />
      <Navigation />
    </div>
  );
};

export default Shopping;
