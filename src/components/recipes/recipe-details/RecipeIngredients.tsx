import { RecipeIngredient } from "@/types/recipe";

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
}

export const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-forest">Ingredients</h3>
      <ul className="list-disc list-inside space-y-1">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="text-forest">
            {ingredient.amount && ingredient.unit
              ? `${ingredient.amount} ${ingredient.unit} ${ingredient.ingredient}`
              : ingredient.amount
              ? `${ingredient.amount} ${ingredient.ingredient}`
              : ingredient.ingredient}
          </li>
        ))}
      </ul>
    </div>
  );
};