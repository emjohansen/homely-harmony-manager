import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRecipeOperations } from "@/hooks/use-recipe-operations";

interface RecipeFormSubmitProps {
  mode: 'create' | 'edit';
  recipeId?: string;
  formData: {
    title: string;
    description: string;
    servings: number;
    prepTime: number;
    isPublic: boolean;
    tags: string[];
    ingredients: { ingredient: string; amount: string; unit: string }[];
    steps: { description: string }[];
  };
}

export const useRecipeSubmit = ({ mode, recipeId, formData }: RecipeFormSubmitProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recipeOperations = useRecipeOperations();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      console.log("Starting recipe submission...");
      setIsSubmitting(true);

      // Validate ingredient amounts
      const invalidIngredients = formData.ingredients.filter(ing => {
        if (!ing.amount) return false;
        return isNaN(parseFloat(ing.amount));
      });

      if (invalidIngredients.length > 0) {
        toast({
          title: "Invalid amount",
          description: "All amounts must be numbers",
          variant: "destructive",
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log("Auth session:", session);
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create recipes",
          variant: "destructive",
        });
        return;
      }

      // Fetch user's current household
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile?.current_household) {
        toast({
          title: "Error",
          description: "You must select an active household to create recipes",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating recipe with household:", profile.current_household);

      const recipeData = {
        title: formData.title,
        description: formData.description,
        servings: formData.servings,
        preparation_time: formData.prepTime,
        is_public: formData.isPublic,
        created_by: session.user.id,
        household_id: profile.current_household,
      };

      if (mode === 'create') {
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select()
          .single();

        if (recipeError) {
          console.error('Error creating recipe:', recipeError);
          throw recipeError;
        }

        console.log("Recipe created:", recipe);

        await Promise.all([
          recipeOperations.insertRecipeTags(recipe.id, formData.tags),
          recipeOperations.insertRecipeIngredients(recipe.id, formData.ingredients),
          recipeOperations.insertRecipeSteps(recipe.id, formData.steps)
        ]);

        toast({
          title: "Success",
          description: "Recipe created!",
        });
        navigate("/recipes");
      } else {
        if (!recipeId) return;

        const { error: recipeError } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq('id', recipeId);

        if (recipeError) {
          console.error('Error updating recipe:', recipeError);
          throw recipeError;
        }

        await recipeOperations.updateRecipeRelations(
          recipeId,
          formData.tags,
          formData.ingredients,
          formData.steps
        );

        toast({
          title: "Success",
          description: "Recipe updated!",
        });
        navigate(`/recipes/${recipeId}`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not save the recipe",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};