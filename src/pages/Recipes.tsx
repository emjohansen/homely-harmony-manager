import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle, Utensils } from "lucide-react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/hooks/use-recipes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recipe } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";

export const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: recipes, isLoading } = useRecipes();

  const privateRecipes = recipes?.filter((recipe) => !recipe.is_public) ?? [];
  const publicRecipes = recipes?.filter((recipe) => recipe.is_public) ?? [];

  const getRandomRecipe = (recipeList: Recipe[]) => {
    if (recipeList.length === 0) {
      toast({
        title: "No recipes found",
        description: "Add some recipes first!",
        variant: "destructive",
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * recipeList.length);
    const randomRecipe = recipeList[randomIndex];
    navigate(`/recipes/${randomRecipe.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div
        className="relative h-[300px] bg-gradient-to-r from-blue-600 to-blue-700 flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E')",
        }}
      >
        <Utensils className="absolute opacity-10 h-64 w-64 text-white transform -translate-y-8" />
        <h1 className="relative text-8xl font-bold mb-2 text-white uppercase tracking-wider font-dongle">
          RECIPES
        </h1>
        <div className="relative flex gap-2">
          <Button
            onClick={() => navigate("/recipes/new")}
            variant="outline"
            className="bg-white hover:bg-gray-100 text-2xl font-dongle h-12 px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Recipe
          </Button>
          <Button
            onClick={() => getRandomRecipe(privateRecipes)}
            variant="outline"
            className="bg-white hover:bg-gray-100 h-12 px-4"
            title="Get random recipe"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        <Tabs defaultValue="private" className="w-full">
          <div className="sticky top-0 bg-gray-50 pt-6 pb-4 z-10">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="private">My Recipes</TabsTrigger>
                <TabsTrigger value="public">All Recipes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="private">
              <RecipeList recipes={privateRecipes} />
            </TabsContent>

            <TabsContent value="public">
              <RecipeList recipes={publicRecipes} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};