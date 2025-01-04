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
import type { Recipe } from "@/types/recipe";

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

  const getRandomRecipe = (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      toast({
        title: "No recipes",
        description: "No recipes available in this category!",
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    navigate(`/recipes/${recipes[randomIndex].id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div 
        className="relative h-[50vh] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/lovable-uploads/6365d7fa-1a30-4c0d-96e4-15af77dfe48e.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Utensils className="absolute opacity-10 h-64 w-64 text-white transform -translate-y-8" />
        <h1 className="relative text-7xl font-bold mb-4 text-white uppercase tracking-wider font-dongle">RECIPES</h1>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : (
          <Tabs 
            defaultValue="private" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "private" | "public")}
          >
            <div className="flex justify-center items-center mb-4">
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="private">My Recipes</TabsTrigger>
                <TabsTrigger value="public">All Recipes</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="private">
              {!currentHouseholdId ? (
                <div className="text-center py-8 text-gray-500">
                  Join a household to start adding your own recipes!
                </div>
              ) : privateRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recipes yet. Add your first recipe!
                </div>
              ) : (
                <RecipeList recipes={privateRecipes} />
              )}
            </TabsContent>
            <TabsContent value="public">
              {publicRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
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
        className="fixed bottom-20 right-4 w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center border-none"
        size="icon"
      >
        <Plus className="h-10 w-10 text-white" />
      </Button>
      
      <Navigation />
    </div>
  );
};

export default Recipes;
