import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Clock, Users, Scale, Tag, UtensilsCrossed, ListChecks } from "lucide-react";
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
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      {canEdit && (
        <div className="mb-6">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      {/* Hero Section with Image and Title */}
      <div className="relative">
        {recipe.image_url ? (
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <h1 className="text-4xl font-bold text-white mb-2">{recipe.title}</h1>
              <p className="text-gray-200 text-lg">{recipe.description}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-600 text-lg">{recipe.description}</p>
          </div>
        )}
      </div>

      {/* Recipe Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:border-gray-300 transition-all">
          <Users className="h-6 w-6 text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Porsjoner</p>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(-1)}
              disabled={currentServings <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium w-8 text-center">{currentServings}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(1)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:border-gray-300 transition-all">
          <Clock className="h-6 w-6 text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Tilberedningstid</p>
          <p className="text-lg font-medium">{recipe.preparation_time} min</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:border-gray-300 transition-all">
          <Scale className="h-6 w-6 text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Måleenheter</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAlternativeUnits(!showAlternativeUnits)}
            className="text-sm font-medium hover:bg-gray-100"
          >
            {showAlternativeUnits ? "Vis metrisk" : "Vis amerikansk"}
          </Button>
        </div>
      </div>

      {/* Tags Section */}
      {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Tagger</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {recipe.recipe_tags.map(({ tag }) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients Section */}
      {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Ingredienser</h2>
          </div>
          <ul className="space-y-3">
            {recipe.recipe_ingredients.map((ingredient) => (
              <li 
                key={ingredient.id} 
                className={cn(
                  "flex items-baseline p-3 rounded",
                  "hover:bg-gray-50 transition-colors duration-200"
                )}
              >
                <span className="font-medium text-gray-700 min-w-[120px]">
                  {renderAmount(ingredient.amount, ingredient.unit)}
                </span>
                <span className="text-gray-600">{ingredient.ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps Section */}
      {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Fremgangsmåte</h2>
          </div>
          <ol className="space-y-6">
            {recipe.recipe_steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => (
                <li key={step.id} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-medium text-gray-600">
                    {step.step_number}
                  </span>
                  <p className="text-gray-600 leading-relaxed pt-1">{step.description}</p>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};