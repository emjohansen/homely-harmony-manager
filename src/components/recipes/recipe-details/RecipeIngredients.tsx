import { RecipeIngredient } from "@/types/recipe";
import { UtensilsCrossed } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  renderAmount: (amount: number | string | null, unit: string | null) => string;
}

export const RecipeIngredients = ({ ingredients, renderAmount }: RecipeIngredientsProps) => {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="ingredients" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-foreground">Ingredients</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-0">
            {ingredients.map((ingredient) => {
              const amountAndUnit = renderAmount(ingredient.amount, ingredient.unit);
              return (
                <li key={ingredient.id} className="border-b border-gray-100 py-3 last:border-0">
                  <div className="flex items-start">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{amountAndUnit}</span>
                      <span className="text-muted-foreground font-mono"> // </span>
                      {ingredient.ingredient}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};