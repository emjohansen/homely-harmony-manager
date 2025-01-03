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
        "space-y-3 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="flex gap-4 group">
              <span className="flex-shrink-0 w-7 h-7 bg-primary/5 rounded-full 
                            border border-primary/10
                            flex items-center justify-center text-sm font-medium text-primary/80
                            group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                {step.step_number}
              </span>
              <p className="text-sm leading-relaxed pt-1 group-hover:text-primary/90 transition-colors duration-300">
                {step.description}
              </p>
            </li>
          ))}
      </ol>
    </div>
  );
};