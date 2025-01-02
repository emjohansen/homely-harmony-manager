import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface RecipeContentProps {
  recipe: Recipe;
  canEdit: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export const RecipeContent = ({ recipe, canEdit, onVisibilityChange }: RecipeContentProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, currentServings + delta);
    setCurrentServings(newServings);
  };

  const calculateAdjustedAmount = (amount: number | null) => {
    if (!amount || !recipe.servings) return amount;
    return ((amount * currentServings) / recipe.servings).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {canEdit && (
        <div className="mb-6">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      {recipe.image_url && (
        <div className="relative w-full h-64 mb-6">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
      <p className="text-gray-600 mb-4">{recipe.description}</p>

      <div className="flex gap-4 mb-4">
        <div className="space-y-2">
          <span className="text-sm text-gray-500">Porsjoner</span>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(-1)}
              disabled={currentServings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{currentServings}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500">Tilberedningstid</span>
          <p className="font-medium">{recipe.preparation_time} mins</p>
        </div>
      </div>

      {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.recipe_tags.map(({ tag }) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Ingredienser</h2>
          <ul className="space-y-2">
            {recipe.recipe_ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-baseline">
                <span className="font-medium mr-2">
                  {calculateAdjustedAmount(ingredient.amount)} {ingredient.unit}
                </span>
                <span>{ingredient.ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Fremgangsmåte</h2>
          <ol className="space-y-4">
            {recipe.recipe_steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => (
                <li key={step.id} className="flex">
                  <span className="font-medium mr-4">{step.step_number}.</span>
                  <span>{step.description}</span>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};