import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { convertUnits, getAlternativeUnit, isMetricUnit, isImperialUnit } from "@/utils/unitConversion";
import { RecipeMetrics } from "./recipe-details/RecipeMetrics";
import { RecipeTagsDisplay } from "./recipe-details/RecipeTags";
import { RecipeIngredients } from "./recipe-details/RecipeIngredients";
import { RecipeStepsList } from "./recipe-details/RecipeSteps";

interface RecipeContentProps {
  recipe: Recipe;
  canEdit: boolean;
  isEditing?: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export const RecipeContent = ({ 
  recipe, 
  canEdit, 
  isEditing,
  onVisibilityChange 
}: RecipeContentProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings || 1);
  const [showAlternativeUnits, setShowAlternativeUnits] = useState(false);

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, currentServings + delta);
    setCurrentServings(newServings);
  };

  const parseAmount = (amount: string | number | null): number | null => {
    if (amount === null) return null;
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(parsed) ? null : parsed;
  };

  const calculateAdjustedAmount = (amount: string | number | null) => {
    if (!amount || !recipe.servings) return amount;
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) return amount;
    
    const adjustedAmount = (parsedAmount * currentServings) / recipe.servings;
    return adjustedAmount % 1 === 0 ? adjustedAmount : Number(adjustedAmount.toFixed(1));
  };

  const formatNumber = (num: number): string => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  const renderAmount = (amount: string | number | null, unit: string | null) => {
    if (!amount || !unit) return `${amount || ''} ${unit || ''}`;
    
    const adjustedAmount = calculateAdjustedAmount(amount);
    if (!adjustedAmount) return `${amount} ${unit}`;

    const parsedAmount = parseAmount(adjustedAmount);
    if (parsedAmount === null) return `${amount} ${unit}`;

    const shouldConvert = (showAlternativeUnits && isMetricUnit(unit)) || 
                         (!showAlternativeUnits && isImperialUnit(unit));

    if (!shouldConvert) return `${formatNumber(parsedAmount)} ${unit}`;

    const alternativeUnit = getAlternativeUnit(unit);
    if (!alternativeUnit) return `${formatNumber(parsedAmount)} ${unit}`;

    const convertedAmount = convertUnits(parsedAmount, unit as any, alternativeUnit as any);
    if (convertedAmount === null) return `${formatNumber(parsedAmount)} ${unit}`;

    return `${formatNumber(convertedAmount)} ${alternativeUnit}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 space-y-4 mx-auto max-w-2xl">
      {canEdit && isEditing && (
        <div className="mb-2">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      {recipe.image_url && (
        <div className="relative w-full h-[250px] rounded-lg overflow-hidden -mt-1 -mx-3">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-0 text-center">
        <h1 className="text-xl font-bold text-foreground break-words whitespace-pre-wrap">
          {recipe.title.length > 30 ? `${recipe.title.slice(0, 30)}\n${recipe.title.slice(30)}` : recipe.title}
        </h1>
        <p className="text-sm text-foreground">
          {recipe.description}
        </p>
        <RecipeTagsDisplay tags={recipe.recipe_tags || []} />
      </div>

      <RecipeMetrics
        currentServings={currentServings}
        onServingsChange={handleServingsChange}
        preparationTime={recipe.preparation_time}
        showAlternativeUnits={showAlternativeUnits}
        onToggleUnits={() => setShowAlternativeUnits(!showAlternativeUnits)}
      />

      <RecipeIngredients
        ingredients={recipe.recipe_ingredients || []}
        renderAmount={renderAmount}
      />

      <RecipeStepsList steps={recipe.recipe_steps || []} />
    </div>
  );
};