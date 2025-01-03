import { RecipeStep } from "@/types/recipe";
import { ListChecks } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export const RecipeStepsList = ({ steps }: RecipeStepsProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="steps" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-foreground">Instructions</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ol className="space-y-0">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};