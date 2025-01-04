import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { RecipeHeader } from "@/components/recipes/RecipeHeader";
import { RecipeContent } from "@/components/recipes/RecipeContent";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error",
          description: "Failed to load recipe details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  useEffect(() => {
    const checkEditPermissions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && recipe) {
        if (recipe.is_public) {
          setCanEdit(recipe.created_by === session.user.id);
        } else {
          const { data: householdMember } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', session.user.id)
            .eq('household_id', recipe.household_id)
            .single();
          
          setCanEdit(!!householdMember);
        }
      }
    };

    checkEditPermissions();
  }, [recipe]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

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

      setRecipe({ ...recipe, is_public: isPublic });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">Loading recipe details...</div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">Recipe not found</div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <RecipeHeader 
          canEdit={canEdit} 
          recipeId={recipe.id} 
          handleDelete={handleDelete}
          title={recipe.title}
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
};

export default RecipeDetails;