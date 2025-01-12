import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";
import { RecipeContent } from "@/components/recipes/RecipeContent";
import { RecipeHeader } from "@/components/recipes/RecipeHeader";
import { PageLogo } from "@/components/common/PageLogo";
import Navigation from "@/components/Navigation";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      // Get current user and their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view recipes",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', user.id)
        .single();

      // Fetch recipe data
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
      
      const recipeData: Recipe = {
        id: data.id,
        household_id: data.household_id,
        created_by: data.created_by,
        title: data.title,
        description: data.description,
        servings: data.servings,
        preparation_time: data.preparation_time,
        is_public: data.is_public,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        image_url: data.image_url || null,
        recipe_tags: data.recipe_tags,
        recipe_ingredients: data.recipe_ingredients?.map((ingredient: any) => ({
          ...ingredient,
          amount: ingredient.amount ? parseFloat(ingredient.amount) : null
        })),
        recipe_steps: data.recipe_steps
      };
      
      setRecipe(recipeData);

      // User can edit if they're in the same household that created the recipe
      const userCanEdit = profile?.current_household === data.household_id;
      setCanEdit(userCanEdit);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PageLogo />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <RecipeHeader 
          recipeId={recipe.id}
          canEdit={canEdit}
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