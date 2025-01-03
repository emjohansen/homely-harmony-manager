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
    <div className="max-w-xl mx-auto px-4">
      <div className="bg-[#FEF7CD] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <UtensilsCrossed className="h-5 w-5 text-[#FEC6A1]" />
          <h2 className="text-2xl font-semibold text-[#8B7355]">Ingredienser</h2>
        </div>
        
        <div className="space-y-3">
          {recipe.recipe_ingredients.map((ingredient, index) => (
            <div 
              key={ingredient.id} 
              className={cn(
                "flex items-center rounded-2xl p-3 transition-all duration-200 hover:transform hover:scale-102",
                index % 2 === 0 ? "bg-[#F2FCE2]" : "bg-[#E5DEFF]"
              )}
            >
              <div className="w-1/3 pr-4 text-right">
                <span className="font-medium text-[#FEC6A1] bg-white px-3 py-1 rounded-full text-sm">
                  {renderAmount(ingredient.amount, ingredient.unit)}
                </span>
              </div>
              
              <div className="w-2/3 pl-4 border-l-2 border-[#FDE1D3]">
                <span className="text-[#8B7355] text-lg">
                  {ingredient.ingredient}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};