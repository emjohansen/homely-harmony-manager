import { RecipeIngredient } from "@/types/recipe";
import { UtensilsCrossed } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecipeIngredientsListProps {
  ingredients: RecipeIngredient[];
  renderAmount: (amount: number | null, unit: string | null) => string;
}

export const RecipeIngredientsList = ({ ingredients, renderAmount }: RecipeIngredientsListProps) => {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="ingredients" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-foreground">Ingredienser</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-0">
            {ingredients.map((ingredient) => {
              const amountAndUnit = renderAmount(ingredient.amount, ingredient.unit);
              return (
                <li key={ingredient.id} className="border-b border-gray-100 py-3 last:border-0">
                  <div className="flex items-center">
                    <div className="flex items-center min-w-[100px] justify-end">
                      <span className="font-bold text-sm">{amountAndUnit}</span>
                    </div>
                    <span className="text-muted-foreground font-mono mx-2">•</span>
                    <span className="text-sm">{ingredient.ingredient}</span>
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