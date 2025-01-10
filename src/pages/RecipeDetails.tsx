import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";
import { RecipeContent } from "@/components/recipes/RecipeContent";
import { RecipeHeader } from "@/components/recipes/RecipeHeader";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_tags (*),
          recipe_ingredients (*),
          recipe_steps (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert the recipe data to match our Recipe type
      const recipeData: Recipe = {
        ...data,
        updated_at: data.updated_at || data.created_at,
        image_url: data.image_url || null,
        recipe_ingredients: data.recipe_ingredients?.map((ingredient: any) => ({
          ...ingredient,
          amount: ingredient.amount ? parseFloat(ingredient.amount) : null
        }))
      };
      
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recipe details",
        variant: "destructive",
      });
      navigate("/recipes");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      navigate("/recipes");
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = async (isPublic: boolean) => {
    if (!recipe) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ is_public: isPublic })
        .eq('id', recipe.id);

      if (error) throw error;
      
      setRecipe(prev => prev ? { ...prev, is_public: isPublic } : null);
      
      toast({
        title: "Success",
        description: `Recipe is now ${isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      console.error('Error updating recipe visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe visibility",
        variant: "destructive",
      });
    }
  };

  if (!recipe) {
    return <div>Loading...</div>;
  }

  const canEdit = user?.id === recipe.created_by || 
                 (recipe.household_id && user?.current_household === recipe.household_id);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <RecipeHeader 
          canEdit={canEdit}
          recipeId={recipe.id}
          handleDelete={handleDelete}
        />
        <RecipeContent 
          recipe={recipe}
          canEdit={canEdit}
          onVisibilityChange={handleVisibilityChange}
        />
      </div>
      <Navigation />
    </div>
  );
}