import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Shuffle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@/types/recipe";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        fetchRecipes();
      }
    };
    
    checkUser();
  }, [navigate]);

  const fetchRecipes = async () => {
    try {
      const { data: recipesData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_tags (tag),
          recipe_ingredients (id, ingredient, amount, unit),
          recipe_steps (id, step_number, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRandomRecipe = () => {
    if (recipes.length === 0) {
      toast({
        title: "No recipes",
        description: "Add some recipes first!",
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    navigate(`/recipes/${recipes[randomIndex].id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={getRandomRecipe}
              title="Random Recipe"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/recipes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recipes yet. Add your first recipe!
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <h3 className="font-semibold">{recipe.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {recipe.preparation_time} mins • {recipe.servings} servings
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipe.recipe_tags?.map(({ tag }) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
};

export default Recipes;