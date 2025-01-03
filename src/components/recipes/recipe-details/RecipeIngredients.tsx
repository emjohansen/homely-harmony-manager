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
    <div className="space-y-4 mt-8">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left"
      >
        <UtensilsCrossed className="h-5 w-5" />
        <h2 className="text-xl font-semibold flex-1">Ingredienser</h2>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </button>
      <ul className={cn(
        "space-y-2 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
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