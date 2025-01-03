import { RecipeIngredient } from "@/types/recipe";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  renderAmount: (amount: number | null, unit: string | null) => string;
}

export const RecipeIngredientsList = ({ ingredients, renderAmount }: RecipeIngredientsProps) => {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Ingredienser</h2>
      </div>
      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li 
            key={ingredient.id} 
            className={cn(
              "flex items-baseline p-3 rounded-lg bg-white",
              "border border-border border-opacity-20 transition-all duration-300",
              "hover:border-opacity-100"
            )}
          >
            <span className="font-medium min-w-[120px]">
              {renderAmount(ingredient.amount, ingredient.unit)}
            </span>
            <span className="text-foreground">{ingredient.ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};