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
    let isMounted = true;
    
    const initialize = async () => {
      try {
        console.log('Initializing Shopping component');
        
        // Get session once and reuse it
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!sessionData.session) {
          console.log('No session found, redirecting to login');
          navigate('/');
          return;
        }

        if (!isMounted) return;

        // Use the session we already have
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_household')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        if (!isMounted) return;

        if (profile?.current_household) {
          console.log('Current household found:', profile.current_household);
          setCurrentHouseholdId(profile.current_household);
          await fetchShoppingLists(profile.current_household, sessionData.session);
        } else {
          console.log('No current household found');
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Error in initialize:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Please try logging in again",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  const fetchShoppingLists = async (householdId: string, session: any) => {
    if (!session?.user?.id) {
      console.error('No valid session for fetching shopping lists');
      return;
    }

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
        console.error('Error fetching shopping lists:', error);
        throw error;
      }

      console.log('Successfully fetched shopping lists:', data);
      setLists(data || []);
    } catch (error) {
      console.error('Error in fetchShoppingLists:', error);
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: "Error",
          description: "Please login again to continue",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          name,
          household_id: currentHouseholdId,
          created_by: session.user.id,
          status: 'active'
        });

      if (error) throw error;
      
      await fetchShoppingLists(currentHouseholdId, session);
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
          <ShoppingTabs 
            currentHouseholdId={currentHouseholdId}
            lists={lists}
            onListsChange={() => currentHouseholdId && fetchShoppingLists(currentHouseholdId, null)}
          />
        )}
      </div>

      <NewShoppingList onCreateList={handleCreateList} />
      <Navigation />
    </div>
  );
};

export default Shopping;