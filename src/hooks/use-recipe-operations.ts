import { supabase } from "@/integrations/supabase/client";

export const useRecipeOperations = () => {
  const insertRecipeTags = async (recipeId: string, tags: string[]) => {
    if (tags.length > 0) {
      return supabase
        .from("recipe_tags")
        .insert(tags.map(tag => ({
          recipe_id: recipeId,
          tag
        })));
    }
  };

  const insertRecipeIngredients = async (
    recipeId: string, 
    ingredients: { ingredient: string; amount: string; unit: string }[]
  ) => {
    const validIngredients = ingredients.filter(i => i.ingredient.trim());
    if (validIngredients.length > 0) {
      return supabase
        .from("recipe_ingredients")
        .insert(validIngredients.map(i => ({
          recipe_id: recipeId,
          ingredient: i.ingredient,
          amount: i.amount ? parseFloat(i.amount) : null,
          unit: i.unit || null
        })));
    }
  };

  const insertRecipeSteps = async (
    recipeId: string, 
    steps: { description: string }[]
  ) => {
    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length > 0) {
      return supabase
        .from("recipe_steps")
        .insert(validSteps.map((s, index) => ({
          recipe_id: recipeId,
          step_number: index + 1,
          description: s.description
        })));
    }
  };

  const updateRecipeRelations = async (
    recipeId: string,
    tags: string[],
    ingredients: { ingredient: string; amount: string; unit: string }[],
    steps: { description: string }[]
  ) => {
    await Promise.all([
      // Delete existing relations
      supabase.from("recipe_tags").delete().eq('recipe_id', recipeId),
      supabase.from("recipe_ingredients").delete().eq('recipe_id', recipeId),
      supabase.from("recipe_steps").delete().eq('recipe_id', recipeId),
      
      // Insert new relations
      insertRecipeTags(recipeId, tags),
      insertRecipeIngredients(recipeId, ingredients),
      insertRecipeSteps(recipeId, steps)
    ]);
  };

  return {
    insertRecipeTags,
    insertRecipeIngredients,
    insertRecipeSteps,
    updateRecipeRelations
  };
};