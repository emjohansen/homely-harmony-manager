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
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="h-4 w-4" />
        <h2 className="text-lg font-semibold">Fremgangsmåte</h2>
      </div>
      <ol className={cn(
        "space-y-0 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="border-b border-gray-100 py-3 last:border-0">
              <div className="flex items-start gap-4">
                <span className="text-lg font-bold text-foreground min-w-[24px]">
                  {step.step_number}
                </span>
                <p className="text-sm text-foreground flex-1">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
};