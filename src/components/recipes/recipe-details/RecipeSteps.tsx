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
        className="flex items-center gap-2 w-full text-left text-primary"
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
        "space-y-0 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="border-b border-gray-100 py-4 last:border-0">
              <div className="flex flex-col gap-2">
                <span className="text-base font-semibold text-primary">
                  {step.step_number}.
                </span>
                <p className="text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
};