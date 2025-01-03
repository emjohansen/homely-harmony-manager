import { Recipe } from "@/types/recipe";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { convertUnit, getAlternativeUnit, isMetricUnit, isImperialUnit } from "@/utils/unitConversion";

interface RecipeIngredientsListProps {
  recipe: Recipe;
  currentServings: number;
  showAlternativeUnits: boolean;
}

export const RecipeIngredientsList = ({ 
  recipe, 
  currentServings, 
  showAlternativeUnits 
}: RecipeIngredientsListProps) => {
  const calculateAdjustedAmount = (amount: number | null) => {
    if (!amount || !recipe.servings) return amount;
    const adjustedAmount = (amount * currentServings) / recipe.servings;
    return adjustedAmount % 1 === 0 ? adjustedAmount : Number(adjustedAmount.toFixed(1));
  };

  const renderAmount = (amount: number | null, unit: string | null) => {
    if (!amount || !unit) return `${amount || ''} ${unit || ''}`;
    
    const adjustedAmount = calculateAdjustedAmount(amount);
    if (!adjustedAmount) return `${amount} ${unit}`;

    const shouldConvert = (showAlternativeUnits && isMetricUnit(unit)) || 
                         (!showAlternativeUnits && isImperialUnit(unit));

    if (!shouldConvert) return `${adjustedAmount} ${unit}`;

    const alternativeUnit = getAlternativeUnit(unit);
    if (!alternativeUnit) return `${adjustedAmount} ${unit}`;

    const convertedAmount = convertUnit(adjustedAmount, unit, alternativeUnit);
    if (convertedAmount === null) return `${adjustedAmount} ${unit}`;

    return `${Number(convertedAmount).toFixed(1)} ${alternativeUnit}`;
  };

  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <UtensilsCrossed className="h-5 w-5 text-gray-700" />
        <h2 className="text-2xl font-semibold text-gray-900">Ingredienser</h2>
      </div>
      <ul className="space-y-3 divide-y divide-gray-50">
        {recipe.recipe_ingredients.map((ingredient) => (
          <li 
            key={ingredient.id} 
            className={cn(
              "flex items-baseline py-3",
              "hover:bg-gray-50 transition-colors duration-200 rounded-lg px-4",
              "bg-gray-50/30"
            )}
          >
            <span className="font-medium text-gray-900 min-w-[120px] text-right pr-4">
              {renderAmount(ingredient.amount, ingredient.unit)}
            </span>
            <span className="text-gray-700 flex-1">{ingredient.ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};