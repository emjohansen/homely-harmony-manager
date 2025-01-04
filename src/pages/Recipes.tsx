import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Utensils, Shuffle } from "lucide-react";
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
        <h1 className="relative text-8xl font-bold mb-2 text-white uppercase tracking-wider font-dongle">RECIPES</h1>
        <Button
          onClick={() => navigate("/recipes/new")}
          variant="outline"
          className="relative bg-white hover:bg-gray-100 text-2xl font-dongle h-12 px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Recipe
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : (
          <Tabs defaultValue="private" className="w-full">
            <div className="flex justify-center items-center mb-6">
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="private">Mine</TabsTrigger>
                <TabsTrigger value="public">All</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-[300px] mx-auto mb-6">
              <Button
                onClick={() => getRandomRecipe(privateRecipes)}
                variant="outline"
                className="w-full"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
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
      <Navigation />
    </div>
  );
};

export default Recipes;