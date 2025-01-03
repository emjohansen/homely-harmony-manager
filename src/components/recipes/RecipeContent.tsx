import { Recipe } from "@/types/recipe";
import { RecipeVisibility } from "./RecipeVisibility";
import { useState } from "react";
import { RecipeHero } from "./RecipeHero";
import { RecipeQuickInfo } from "./RecipeQuickInfo";
import { RecipeIngredientsList } from "./RecipeIngredientsList";
import { RecipeStepsList } from "./RecipeStepsList";

interface RecipeContentProps {
  recipe: Recipe;
  canEdit: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export const RecipeContent = ({ recipe, canEdit, onVisibilityChange }: RecipeContentProps) => {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [showAlternativeUnits, setShowAlternativeUnits] = useState(false);

  return (
    <div className="space-y-8">
      {canEdit && (
        <div className="mb-6">
          <RecipeVisibility
            isPublic={recipe.is_public || false}
            setIsPublic={onVisibilityChange}
          />
        </div>
      )}

      <RecipeHero recipe={recipe} />
      
      <RecipeQuickInfo 
        recipe={recipe}
        showAlternativeUnits={showAlternativeUnits}
        setShowAlternativeUnits={setShowAlternativeUnits}
      />

      <div className="space-y-8">
        <RecipeIngredientsList 
          recipe={recipe}
          currentServings={currentServings}
          showAlternativeUnits={showAlternativeUnits}
        />
        
        <RecipeStepsList recipe={recipe} />
      </div>
    </div>
  );
};