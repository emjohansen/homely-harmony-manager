import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { NewShoppingList } from "@/components/shopping/NewShoppingList";
import { ShoppingTabs } from "@/components/shopping/ShoppingTabs";

const Shopping = () => {
  const [lists, setLists] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    fetchCurrentHousehold();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('/');
    }
  };

  const fetchCurrentHousehold = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      console.log('Fetching household member data for user:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching current household:', profileError);
        throw profileError;
      }

      console.log('Fetched household member data:', profile);
      if (profile?.current_household) {
        setCurrentHouseholdId(profile.current_household);
        fetchShoppingLists(profile.current_household);
      } else {
        console.log('No current household found for user');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchCurrentHousehold:', error);
      toast({
        title: "Error",
        description: "Failed to fetch household information",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

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

    try {
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
      
      if (currentHouseholdId) {
        fetchShoppingLists(currentHouseholdId);
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div 
        className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-bottom md:bg-top"
        style={{
          backgroundImage: 'url("/lovable-uploads/7e24e64e-7cc7-4287-8a2e-41e46382fd65.png")',
          backgroundSize: 'cover',
        }}
      >
        <ShoppingCart className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-5xl font-bold mb-4 text-cream uppercase tracking-wider">SHOPPING</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-forest">Loading shopping lists...</div>
        ) : (
          <ShoppingTabs 
            currentHouseholdId={currentHouseholdId}
            lists={lists}
            onListsChange={() => currentHouseholdId && fetchShoppingLists(currentHouseholdId)}
          />
        )}
      </div>

      <NewShoppingList onCreateList={handleCreateList} />
      <Navigation />
    </div>
  );
};

export default Shopping;
