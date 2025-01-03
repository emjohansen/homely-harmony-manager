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
            {ingredients.map((ingredient) => (
              <li key={ingredient.id} className="border-b border-gray-100 py-3 last:border-0">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-bold text-foreground min-w-[80px]">
                    {renderAmount(ingredient.amount, ingredient.unit)}
                  </span>
                  <p className="text-sm text-foreground flex-1">
                    {ingredient.ingredient}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};