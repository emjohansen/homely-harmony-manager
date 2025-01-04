import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, CookingPot } from "lucide-react";
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
      <div className="relative h-[50vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background blob */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#8B5CF6"
              d="M45.7,-58.9C59.9,-48.8,72.4,-35.2,77.9,-18.5C83.4,-1.8,81.9,17.9,73.1,33.5C64.3,49.1,48.2,60.5,31,67.1C13.8,73.7,-4.5,75.5,-22.9,71.3C-41.3,67.2,-59.8,57.2,-70.6,41.5C-81.4,25.8,-84.5,4.4,-79.7,-14.2C-74.9,-32.8,-62.2,-48.6,-47,-59.1C-31.8,-69.6,-15.9,-74.8,0.6,-75.6C17.1,-76.4,31.5,-69,45.7,-58.9Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        
        {/* Icon */}
        <div className="relative mb-6">
          <CookingPot className="w-24 h-24 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Heading */}
        <h1 className="relative text-4xl font-bold mb-8 text-white">Recipes</h1>
        
        {/* Add Recipe Button */}
        <Button
          onClick={() => navigate("/recipes/new")}
          variant="outline"
          className="relative bg-white hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Recipe
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : (
          <Tabs defaultValue="private" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="private">Mine</TabsTrigger>
                <TabsTrigger value="public">All</TabsTrigger>
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
      <Navigation />
    </div>
  );
};

export default Recipes;