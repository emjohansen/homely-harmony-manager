import { Recipe } from "@/types/recipe";
import { ListChecks } from "lucide-react";

interface RecipeStepsListProps {
  recipe: Recipe;
}

export const RecipeStepsList = ({ recipe }: RecipeStepsListProps) => {
  if (!recipe.recipe_steps || recipe.recipe_steps.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="h-5 w-5 text-gray-700" />
        <h2 className="text-2xl font-semibold text-gray-900">Fremgangsmåte</h2>
      </div>
      <ol className="space-y-6">
        {recipe.recipe_steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="flex gap-4 group">
              <span className="flex-shrink-0 w-8 h-8 bg-gray-100 group-hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center font-medium text-gray-700">
                {step.step_number}
              </span>
              <p className="text-gray-700 leading-relaxed pt-1">{step.description}</p>
            </li>
          ))}
      </ol>
    </div>
  );
};