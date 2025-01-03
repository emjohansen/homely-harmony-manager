import { RecipeStep } from "@/types/recipe";
import { ListChecks } from "lucide-react";

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export const RecipeStepsList = ({ steps }: RecipeStepsProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Fremgangsmåte</h2>
      </div>
      <ol className="space-y-4">
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="flex gap-4 group">
              <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full 
                            border border-border border-opacity-20
                            flex items-center justify-center font-medium
                            group-hover:border-opacity-100 transition-all duration-300">
                {step.step_number}
              </span>
              <p className="text-foreground leading-relaxed pt-1 group-hover:text-primary transition-colors duration-300">
                {step.description}
              </p>
            </li>
          ))}
      </ol>
    </div>
  );
};