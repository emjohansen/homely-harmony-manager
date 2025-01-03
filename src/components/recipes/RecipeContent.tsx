import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Minus, 
  Plus, 
  Clock, 
  Users, 
  ChefHat, 
  Scale, 
  Tag, 
  Info, 
  UtensilsCrossed, 
  ListChecks,
  Compass
} from "lucide-react";
import { convertUnit, getAlternativeUnit, isMetricUnit, isImperialUnit } from "@/utils/unitConversion";
import { cn } from "@/lib/utils";

interface RecipeContentProps {
  recipe: Recipe;
  canEdit: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export const RecipeContent = ({ recipe, canEdit, onVisibilityChange }: RecipeContentProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [showAlternativeUnits, setShowAlternativeUnits] = useState(false);

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, currentServings + delta);
    setCurrentServings(newServings);
  };

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

  return (
    <div className="bg-[#FEF7CD] rounded-2xl shadow-lg p-8 space-y-8 transition-all duration-300 hover:shadow-xl">
      {canEdit && (
        <div className="mb-6">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      {recipe.image_url && (
        <div className="relative w-full h-[400px] mb-8 rounded-2xl overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="h-6 w-6 text-[#9DBC98] animate-pulse" />
          <h1 className="text-2xl font-semibold text-[#638889]">Din matreise begynner her</h1>
        </div>
        <h2 className="text-3xl font-bold text-[#638889] transition-all duration-300 hover:text-[#9DBC98]">
          {recipe.title}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">{recipe.description}</p>
        
        {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#638889]">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Tagger</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recipe.recipe_tags.map(({ tag }) => (
                <span
                  key={tag}
                  className="bg-[#9DBC98] bg-opacity-20 text-[#638889] px-3 py-1 rounded-full text-xs font-medium
                           transition-all duration-300 hover:bg-opacity-30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center
                      border border-[#9DBC98] border-opacity-20 transition-all duration-300
                      hover:border-opacity-100 hover:shadow-md">
          <Users className="h-6 w-6 text-[#638889] mb-2" />
          <p className="text-sm text-[#638889] mb-2">Porsjoner</p>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(-1)}
              disabled={currentServings <= 1}
              className="h-8 w-8 border-[#9DBC98]"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium w-8 text-center text-[#638889]">{currentServings}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(1)}
              className="h-8 w-8 border-[#9DBC98]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center
                      border border-[#9DBC98] border-opacity-20 transition-all duration-300
                      hover:border-opacity-100 hover:shadow-md">
          <Clock className="h-6 w-6 text-[#638889] mb-2" />
          <p className="text-sm text-[#638889] mb-2">Tilberedningstid</p>
          <p className="text-lg font-medium text-[#638889]">{recipe.preparation_time} min</p>
        </div>

        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center
                      border border-[#9DBC98] border-opacity-20 transition-all duration-300
                      hover:border-opacity-100 hover:shadow-md">
          <Scale className="h-6 w-6 text-[#638889] mb-2" />
          <p className="text-sm text-[#638889] mb-2">Måleenheter</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAlternativeUnits(!showAlternativeUnits)}
            className="text-sm font-medium hover:bg-[#9DBC98] hover:bg-opacity-20 text-[#638889]"
          >
            {showAlternativeUnits ? "Vis metrisk" : "Vis amerikansk"}
          </Button>
        </div>
      </div>

      {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-[#638889]" />
            <h2 className="text-2xl font-semibold text-[#638889]">Ingredienser</h2>
          </div>
          <ul className="space-y-3">
            {recipe.recipe_ingredients.map((ingredient) => (
              <li 
                key={ingredient.id} 
                className={cn(
                  "flex items-baseline p-3 rounded-lg",
                  "hover:bg-[#9DBC98] hover:bg-opacity-10 transition-colors duration-200"
                )}
              >
                <span className="font-medium text-[#638889] min-w-[120px]">
                  {renderAmount(ingredient.amount, ingredient.unit)}
                </span>
                <span className="text-gray-600">{ingredient.ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#638889]" />
            <h2 className="text-2xl font-semibold text-[#638889]">Fremgangsmåte</h2>
          </div>
          <ol className="space-y-6">
            {recipe.recipe_steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => (
                <li key={step.id} className="flex gap-4 group">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#9DBC98] bg-opacity-20 rounded-full 
                                flex items-center justify-center font-medium text-[#638889]
                                group-hover:bg-opacity-30 transition-all duration-300">
                    {step.step_number}
                  </span>
                  <p className="text-gray-600 leading-relaxed pt-1 group-hover:text-[#638889] transition-colors duration-300">
                    {step.description}
                  </p>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};