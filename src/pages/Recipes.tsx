import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle } from "lucide-react";
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
  const [isSliding, setIsSliding] = useState(false);
  
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

  const handleAddRecipe = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate("/recipes/new");
    }, 100);
  };

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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Recipes</h1>
          <Button 
            onClick={handleAddRecipe}
            className="bg-[#0f172ae6] hover:bg-blue-600 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Recipe
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : (
          <Tabs defaultValue="private" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="private">Mine</TabsTrigger>
                <TabsTrigger value="public">All</TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={() => getRandomRecipe(privateRecipes)}
                title="Random Recipe"
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
              <div className="flex justify-end items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getRandomRecipe(publicRecipes)}
                  title="Random Recipe"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random
                </Button>
              </div>
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