import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Users, Clock, Scale, Minus, Plus } from "lucide-react";
import { useState } from "react";

interface RecipeQuickInfoProps {
  recipe: Recipe;
  showAlternativeUnits: boolean;
  setShowAlternativeUnits: (show: boolean) => void;
}

export const RecipeQuickInfo = ({ 
  recipe, 
  showAlternativeUnits, 
  setShowAlternativeUnits 
}: RecipeQuickInfoProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, currentServings + delta);
    setCurrentServings(newServings);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
        <Users className="h-5 w-5 text-gray-500 mb-1" />
        <p className="text-sm text-gray-500 mb-1">Porsjoner</p>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleServingsChange(-1)}
            disabled={currentServings <= 1}
            className="h-7 w-7"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-base font-medium w-6 text-center">{currentServings}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleServingsChange(1)}
            className="h-7 w-7"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
        <Clock className="h-5 w-5 text-gray-500 mb-1" />
        <p className="text-sm text-gray-500 mb-1">Tilberedningstid</p>
        <p className="text-base font-medium">{recipe.preparation_time} min</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
        <Scale className="h-5 w-5 text-gray-500 mb-1" />
        <p className="text-sm text-gray-500 mb-1">Måleenheter</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAlternativeUnits(!showAlternativeUnits)}
          className="text-sm font-medium hover:bg-gray-100 h-7 px-2"
        >
          {showAlternativeUnits ? "Vis metrisk" : "Vis amerikansk"}
        </Button>
      </div>
    </div>
  );
};