import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RecipeFormSubmitProps {
  mode: 'create' | 'edit';
  recipeId?: string;
  formData: {
    title: string;
    description: string;
    servings: number;
    prepTime: number;
    isPublic: boolean;
    imageUrl: string | null;
    tags: string[];
    ingredients: { ingredient: string; amount: string; unit: string }[];
    steps: { description: string }[];
  };
  currentHouseholdId: string | null;
}

export const useRecipeSubmit = ({ mode, recipeId, formData, currentHouseholdId }: RecipeFormSubmitProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      if (!currentHouseholdId) throw new Error("No household selected");

      const recipeData = {
        title: formData.title,
        description: formData.description,
        servings: formData.servings,
        preparation_time: formData.prepTime,
        is_public: formData.isPublic,
        created_by: session.user.id,
        household_id: currentHouseholdId,
        image_url: formData.imageUrl
      };

      if (mode === 'create') {
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select()
          .single();

        if (recipeError) throw recipeError;

        // Insert related data
        await Promise.all([
          // Insert tags
          formData.tags.length > 0 && supabase
            .from("recipe_tags")
            .insert(formData.tags.map(tag => ({
              recipe_id: recipe.id,
              tag
            }))),

          // Insert ingredients
          formData.ingredients.filter(i => i.ingredient.trim()).length > 0 && supabase
            .from("recipe_ingredients")
            .insert(formData.ingredients.filter(i => i.ingredient.trim()).map(i => ({
              recipe_id: recipe.id,
              ingredient: i.ingredient,
              amount: i.amount ? parseFloat(i.amount) : null,
              unit: i.unit || null
            }))),

          // Insert steps
          formData.steps.filter(s => s.description.trim()).length > 0 && supabase
            .from("recipe_steps")
            .insert(formData.steps.filter(s => s.description.trim()).map((s, index) => ({
              recipe_id: recipe.id,
              step_number: index + 1,
              description: s.description
            })))
        ]);

        toast({
          title: "Suksess",
          description: "Oppskrift opprettet!",
        });
        navigate("/recipes");
      } else {
        // Update recipe logic
        const { error: recipeError } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq('id', recipeId);

        if (recipeError) throw recipeError;

        // Update related data
        await Promise.all([
          // Update tags
          supabase.from("recipe_tags").delete().eq('recipe_id', recipeId),
          formData.tags.length > 0 && supabase
            .from("recipe_tags")
            .insert(formData.tags.map(tag => ({
              recipe_id: recipeId,
              tag
            }))),

          // Update ingredients
          supabase.from("recipe_ingredients").delete().eq('recipe_id', recipeId),
          formData.ingredients.filter(i => i.ingredient.trim()).length > 0 && supabase
            .from("recipe_ingredients")
            .insert(formData.ingredients.filter(i => i.ingredient.trim()).map(i => ({
              recipe_id: recipeId,
              ingredient: i.ingredient,
              amount: i.amount ? parseFloat(i.amount) : null,
              unit: i.unit || null
            }))),

          // Update steps
          supabase.from("recipe_steps").delete().eq('recipe_id', recipeId),
          formData.steps.filter(s => s.description.trim()).length > 0 && supabase
            .from("recipe_steps")
            .insert(formData.steps.filter(s => s.description.trim()).map((s, index) => ({
              recipe_id: recipeId,
              step_number: index + 1,
              description: s.description
            })))
        ]);

        toast({
          title: "Suksess",
          description: "Oppskrift oppdatert!",
        });
        navigate(`/recipes/${recipeId}`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Kunne ikke lagre oppskriften",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};