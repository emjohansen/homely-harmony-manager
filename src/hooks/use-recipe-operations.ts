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
    const { data: existingIngredients } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", recipeId);

    const { data: existingSteps } = await supabase
      .from("recipe_steps")
      .select("*")
      .eq("recipe_id", recipeId);

    const { data: existingTags } = await supabase
      .from("recipe_tags")
      .select("*")
      .eq("recipe_id", recipeId);

    // Only update tags if they've changed
    const currentTags = existingTags?.map(t => t.tag) || [];
    if (JSON.stringify(currentTags.sort()) !== JSON.stringify(tags.sort())) {
      await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
      if (tags.length > 0) {
        await insertRecipeTags(recipeId, tags);
      }
    }

    // Only update ingredients if they've changed
    const currentIngredients = existingIngredients?.map(i => ({
      ingredient: i.ingredient,
      amount: i.amount?.toString() || "",
      unit: i.unit || ""
    })) || [];
    
    if (JSON.stringify(currentIngredients) !== JSON.stringify(ingredients)) {
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId);
      if (ingredients.length > 0) {
        await insertRecipeIngredients(recipeId, ingredients);
      }
    }

    // Only update steps if they've changed
    const currentSteps = existingSteps?.map(s => ({
      description: s.description
    })) || [];
    
    if (JSON.stringify(currentSteps) !== JSON.stringify(steps)) {
      await supabase.from("recipe_steps").delete().eq("recipe_id", recipeId);
      if (steps.length > 0) {
        await insertRecipeSteps(recipeId, steps);
      }
    }
  };

  return {
    insertRecipeTags,
    insertRecipeIngredients,
    insertRecipeSteps,
    updateRecipeRelations
  };
};