import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";

interface RecipeContentProps {
  recipe: Recipe;
  canEdit: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export const RecipeContent = ({ recipe, canEdit, onVisibilityChange }: RecipeContentProps) => {
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
        <div>
          <span className="text-sm text-gray-500">Servings</span>
          <p className="font-medium">{recipe.servings}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Preparation Time</span>
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
          <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.recipe_ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-baseline">
                <span className="font-medium mr-2">
                  {ingredient.amount} {ingredient.unit}
                </span>
                <span>{ingredient.ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
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