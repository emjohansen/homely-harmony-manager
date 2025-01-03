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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
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

      <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
        <Clock className="h-6 w-6 text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 mb-2">Tilberedningstid</p>
        <p className="text-lg font-medium">{recipe.preparation_time} min</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-gray-200 transition-all">
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
  );
};