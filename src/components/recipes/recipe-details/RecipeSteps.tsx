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
        className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors duration-300"
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
        "space-y-6 transition-all duration-300",
        isCollapsed ? "hidden" : "block"
      )}>
        {steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((step) => (
            <li key={step.id} className="flex gap-5 group animate-fade-in">
              <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full 
                            border-2 border-primary/20
                            flex items-center justify-center text-base font-semibold text-primary
                            group-hover:bg-primary/20 group-hover:border-primary/30 
                            group-hover:scale-110 transition-all duration-300
                            shadow-sm">
                {step.step_number}
              </span>
              <div className="flex-1 -mt-1">
                <p className="text-sm leading-relaxed pt-1.5 
                           group-hover:text-primary/90 transition-colors duration-300
                           group-hover:translate-x-1 transform transition-transform">
                  {step.description}
                </p>
                <div className="h-0.5 w-0 bg-primary/20 
                             group-hover:w-full transition-all duration-500 mt-2" />
              </div>
            </li>
          ))}
      </ol>
    </div>
  );
};