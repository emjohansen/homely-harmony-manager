import { recipes } from '@/services/localStorage';
import type { Recipe } from '@/types/recipe';

export const useRecipeOperations = () => {
  const insertRecipeTags = async (recipeId: string, tags: string[]) => {
    const recipe = (await recipes.getAll()).find(r => r.id === recipeId);
    if (recipe) {
      await recipes.update(recipeId, {
        ...recipe,
        recipe_tags: tags.map(tag => ({ tag }))
      });
    }
  };

  const insertRecipeIngredients = async (
    recipeId: string,
    ingredients: { ingredient: string; amount: string; unit: string }[]
  ) => {
    const recipe = (await recipes.getAll()).find(r => r.id === recipeId);
    if (recipe) {
      const validIngredients = ingredients
        .filter(i => i.ingredient.trim())
        .map(i => ({
          id: Math.random().toString(36).substr(2, 9),
          ingredient: i.ingredient,
          amount: i.amount || null,
          unit: i.unit || null
        }));

      await recipes.update(recipeId, {
        ...recipe,
        recipe_ingredients: validIngredients
      });
    }
  };

  const insertRecipeSteps = async (
    recipeId: string,
    steps: { description: string }[]
  ) => {
    const recipe = (await recipes.getAll()).find(r => r.id === recipeId);
    if (recipe) {
      const validSteps = steps
        .filter(s => s.description.trim())
        .map((s, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          step_number: index + 1,
          description: s.description
        }));

      await recipes.update(recipeId, {
        ...recipe,
        recipe_steps: validSteps
      });
    }
  };

  const updateRecipeRelations = async (
    recipeId: string,
    tags: string[],
    ingredients: { ingredient: string; amount: string; unit: string }[],
    steps: { description: string }[]
  ) => {
    await Promise.all([
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