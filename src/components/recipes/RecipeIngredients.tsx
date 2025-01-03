import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed, Trash2 } from "lucide-react";

interface RecipeIngredientsProps {
  ingredients: Array<{ ingredient: string; amount: string; unit: string }>;
  setIngredients: (ingredients: Array<{ ingredient: string; amount: string; unit: string }>) => void;
  originalServings?: number;
  currentServings?: number;
}

const commonUnits = [
  // Metric Volume
  { value: "ml", label: "Milliliter (ml)" },
  { value: "dl", label: "Deciliter (dl)" },
  { value: "l", label: "Liter (l)" },
  { value: "tbsp", label: "Tablespoon" },
  { value: "tsp", label: "Teaspoon" },
  { value: "pinch", label: "Pinch" },
  // US Volume
  { value: "cup", label: "Cup" },
  { value: "fl oz", label: "Fluid Ounce" },
  { value: "qt", label: "Quart" },
  { value: "gal", label: "Gallon" },
  { value: "pt", label: "Pint" },
  // Metric Weight
  { value: "g", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "mg", label: "Milligram (mg)" },
  // US Weight
  { value: "oz", label: "Ounce" },
  { value: "lb", label: "Pound" },
  // Count
  { value: "pc", label: "Piece" },
  { value: "bunch", label: "Bunch" },
  { value: "handful", label: "Handful" },
  { value: "package", label: "Package" },
  { value: "can", label: "Can" },
  { value: "glass", label: "Glass" },
  { value: "dash", label: "Dash" },
];

export const RecipeIngredients = ({ 
  ingredients, 
  setIngredients,
  originalServings,
  currentServings 
}: RecipeIngredientsProps) => {
  const handleIngredientChange = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", amount: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const calculateAdjustedAmount = (amount: string) => {
    if (!amount || !originalServings || !currentServings) return amount;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return amount;
    const adjustedAmount = (numericAmount * currentServings) / originalServings;
    return adjustedAmount % 1 === 0 ? adjustedAmount.toString() : adjustedAmount.toFixed(1);
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center gap-2 mb-2">
        <UtensilsCrossed className="h-4 w-4" />
        <Label className="text-lg font-semibold">Ingredients</Label>
      </div>
      <div className="space-y-6">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="space-y-2 p-4 bg-gray-50 rounded-lg relative">
            <div className="absolute right-2 top-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveIngredient(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="w-full">
              <Input
                placeholder="Ingredient"
                value={ingredient.ingredient}
                onChange={(e) => handleIngredientChange(index, "ingredient", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Amount"
                value={originalServings && currentServings ? calculateAdjustedAmount(ingredient.amount) : ingredient.amount}
                onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
              />
              <div className="relative">
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                  list={`units-${index}`}
                />
                <datalist id={`units-${index}`}>
                  {commonUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddIngredient}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add ingredient
      </Button>
    </div>
  );
};