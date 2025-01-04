import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Utensils } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/hooks/use-recipes";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");
  
  const { privateRecipes, publicRecipes, loading, refetch } = useRecipes(currentHouseholdId);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        const { data: householdMember } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        console.log("Current household member:", householdMember);
        if (householdMember) {
          setCurrentHouseholdId(householdMember.household_id);
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div 
        className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/a644aa15-cdb7-4b95-963b-67805fd90fb0.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Utensils className="absolute opacity-10 h-64 w-64 text-cream transform -translate-y-8" />
        <h1 className="relative text-7xl font-bold mb-4 text-cream uppercase tracking-wider font-dongle">RECIPES</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-forest">Loading recipes...</div>
        ) : (
          <Tabs 
            defaultValue="private" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "private" | "public")}
          >
            <TabsList className="grid w-full grid-cols-2 overflow-visible bg-cream p-0 [&_[data-state=active]]:bg-sage [&_[data-state=active]]:text-cream [&_[data-state=active]]:border-sage [&_[data-state=active]]:border [&_[data-state=active]]:border-b [&_[data-state=inactive]]:bg-mint [&_[data-state=inactive]]:border-sage [&_[data-state=inactive]]:border [&_[data-state=inactive]]:border-b">
              <TabsTrigger value="private" className="text-forest font-dongle text-[22px] h-[42px]">My Recipes</TabsTrigger>
              <TabsTrigger value="public" className="text-forest font-dongle text-[22px] h-[42px]">All Recipes</TabsTrigger>
            </TabsList>
            <TabsContent value="private" className="w-full">
              {!currentHouseholdId ? (
                <div className="text-center py-8 text-forest">
                  Join a household to start adding your own recipes!
                </div>
              ) : privateRecipes.length === 0 ? (
                <div className="text-center py-8 text-forest">
                  No recipes yet. Add your first recipe!
                </div>
              ) : (
                <RecipeList recipes={privateRecipes} />
              )}
            </TabsContent>
            <TabsContent value="public" className="w-full">
              {publicRecipes.length === 0 ? (
                <div className="text-center py-8 text-forest">
                  No public recipes available.
                </div>
              ) : (
                <RecipeList recipes={publicRecipes} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Button
        onClick={() => navigate("/recipes/new")}
        className="fixed bottom-20 right-4 w-16 h-16 rounded-full bg-sage hover:bg-mint transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center border-none"
        size="icon"
      >
        <Plus className="h-12 w-12 text-cream group-hover:text-forest" />
      </Button>
      
      <Navigation />
    </div>
  );
};

export default Recipes;