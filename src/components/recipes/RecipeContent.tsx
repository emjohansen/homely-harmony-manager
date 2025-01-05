import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { convertUnits, getAlternativeUnit, isMetricUnit, isImperialUnit } from "@/utils/unitConversion";
import { RecipeMetrics } from "./recipe-details/RecipeMetrics";
import { RecipeTagsDisplay } from "./recipe-details/RecipeTags";
import { RecipeIngredientsList } from "./recipe-details/RecipeIngredients";
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

  const formatNumber = (num: number): string => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  const renderAmount = (amount: number | null, unit: string | null) => {
    if (!amount || !unit) return `${amount || ''} ${unit || ''}`;
    
    const adjustedAmount = calculateAdjustedAmount(amount);
    if (!adjustedAmount) return `${amount} ${unit}`;

    const shouldConvert = (showAlternativeUnits && isMetricUnit(unit)) || 
                         (!showAlternativeUnits && isImperialUnit(unit));

    if (!shouldConvert) return `${formatNumber(adjustedAmount)} ${unit}`;

    const alternativeUnit = getAlternativeUnit(unit);
    if (!alternativeUnit) return `${formatNumber(adjustedAmount)} ${unit}`;

    const convertedAmount = convertUnits(adjustedAmount, unit as any, alternativeUnit as any);
    if (convertedAmount === null) return `${formatNumber(adjustedAmount)} ${unit}`;

    return `${formatNumber(convertedAmount)} ${alternativeUnit}`;
  };

  return (
    <div className="bg-mint rounded-lg p-4 space-y-4 mx-auto max-w-2xl">
      {canEdit && isEditing && (
        <div className="mb-2">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      {recipe.image_url && (
        <div className="relative w-full h-[250px] rounded-lg overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-forest break-words whitespace-pre-wrap">
          {recipe.title.length > 30 ? `${recipe.title.slice(0, 30)}\n${recipe.title.slice(30)}` : recipe.title}
        </h1>
        <p className="text-sm text-forest">
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

      <RecipeIngredientsList
        ingredients={recipe.recipe_ingredients || []}
        renderAmount={renderAmount}
      />

      <RecipeStepsList steps={recipe.recipe_steps || []} />
    </div>
  );
};