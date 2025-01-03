import { RecipeIngredient } from "@/types/recipe";
import { UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  renderAmount: (amount: number | null, unit: string | null) => string;
}

export const RecipeIngredientsList = ({ ingredients, renderAmount }: RecipeIngredientsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="space-y-2">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left"
      >
        <UtensilsCrossed className="h-4 w-4" />
        <h2 className="text-lg font-semibold flex-1">Ingredienser</h2>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>
      <ul className={cn(
        "space-y-1 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {ingredients.map((ingredient) => (
          <li 
            key={ingredient.id} 
            className="flex items-baseline py-1"
          >
            <span className="font-medium text-sm min-w-[90px]">
              {renderAmount(ingredient.amount, ingredient.unit)}
            </span>
            <span className="text-sm">{ingredient.ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};