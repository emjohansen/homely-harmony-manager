import { RecipeStep } from "@/types/recipe";
import { ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export const RecipeStepsList = ({ steps }: RecipeStepsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left"
      >
        <ListChecks className="h-4 w-4" />
        <h2 className="text-lg font-semibold flex-1">Fremgangsmåte</h2>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>
      <ol className={cn(
        "space-y-2 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="flex gap-3 group">
              <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full 
                            border border-border border-opacity-20
                            flex items-center justify-center text-sm font-medium
                            group-hover:border-opacity-100 transition-all duration-300">
                {step.step_number}
              </span>
              <p className="text-sm leading-relaxed pt-0.5 group-hover:text-primary transition-colors duration-300">
                {step.description}
              </p>
            </li>
          ))}
      </ol>
    </div>
  );
};