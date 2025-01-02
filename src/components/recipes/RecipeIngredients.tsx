import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RecipeIngredientsProps {
  ingredients: Array<{ ingredient: string; amount: string; unit: string }>;
  setIngredients: (ingredients: Array<{ ingredient: string; amount: string; unit: string }>) => void;
  originalServings?: number;
  currentServings?: number;
}

export const RecipeIngredients = ({ 
  ingredients, 
  setIngredients,
  originalServings,
  currentServings 
}: RecipeIngredientsProps) => {
  const handleIngredientChange = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const newIngredients = [...ingredients];
    if (field === 'amount') {
      // Allow only numbers and decimal point
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        newIngredients[index][field] = value;
      }
    } else {
      newIngredients[index][field] = value;
    }
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", amount: "", unit: "" }]);
  };

  const calculateAdjustedAmount = (amount: string) => {
    if (!amount || !originalServings || !currentServings) return amount;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return amount;
    return ((numericAmount * currentServings) / originalServings).toFixed(2);
  };

  return (
    <div className="space-y-2">
      <Label>Ingredienser</Label>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="grid grid-cols-6 gap-2">
          <Input
            className="col-span-3"
            placeholder="Ingrediens"
            value={ingredient.ingredient}
            onChange={(e) => handleIngredientChange(index, "ingredient", e.target.value)}
          />
          <Input
            className="col-span-2"
            placeholder="Mengde"
            value={originalServings && currentServings ? calculateAdjustedAmount(ingredient.amount) : ingredient.amount}
            onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
          />
          <Input
            className="col-span-1"
            placeholder="Enhet"
            value={ingredient.unit}
            onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddIngredient}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Legg til ingrediens
      </Button>
    </div>
  );
};