import { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface RecipeListProps {
  recipes: Recipe[];
}

const TAG_CATEGORIES = {
  mealType: {
    label: "Måltidstype",
    options: ["Frokost", "Lunsj", "Middag", "Dessert", "Snacks", "Drikke"]
  },
  difficulty: {
    label: "Vanskelighetsgrad",
    options: ["Enkel", "Middels", "Avansert"]
  },
  allergens: {
    label: "Allergener",
    options: [
      "Glutenfri", 
      "Laktosefri", 
      "Nøttefri", 
      "Eggfri", 
      "Soyafri",
      "Melkefri",
      "Sesamfri",
      "Skalldyrfri",
      "Fiskefri",
      "Sellerfri",
      "Sennepfri",
      "Sulfittfri"
    ]
  },
  meatType: {
    label: "Kjøtttype",
    options: [
      "Kylling", 
      "Kalkun",
      "Storfe", 
      "Svin", 
      "Lam", 
      "Fisk", 
      "Skalldyr",
      "Vilt",
      "And"
    ]
  },
  dietType: {
    label: "Kosthold",
    options: [
      "Vegansk",
      "Vegetarisk",
      "Pescetariansk",
      "Ketogen",
      "Lavkarbo",
      "Paleo"
    ]
  },
  misc: {
    label: "Annet",
    options: [
      "Sunn", 
      "Rask", 
      "Budsjettvennlig", 
      "Festmat", 
      "Tradisjonell", 
      "Internasjonal",
      "Grillet",
      "Bakt",
      "Kokt",
      "Stekt",
      "Dampet",
      "Fersk",
      "Sesongbasert",
      "Barnevennlig",
      "Frossen",
      "Matlaging i bulk",
      "Lite oppvask",
      "En-potte rett",
      "Slow cooker",
      "Airfryer",
      "Matpakke"
    ]
  }
};

export const RecipeList = ({ recipes }: RecipeListProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tag =>
      recipe.recipe_tags?.some(recipeTag => recipeTag.tag === tag)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          {showFilters ? "Skjul filter" : "Vis filter"}
        </Button>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-sm text-gray-500"
          >
            Nullstill filter
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mb-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
              <AccordionItem key={key} value={key} className="border rounded-lg bg-white shadow-sm">
                <AccordionTrigger className="px-4">
                  <span className="text-sm font-semibold">{category.label}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {category.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-${key}-${option}`}
                          checked={selectedTags.includes(option)}
                          onCheckedChange={() => toggleTag(option)}
                        />
                        <label
                          htmlFor={`filter-${key}-${option}`}
                          className="text-sm cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Ingen oppskrifter funnet med valgte filter
        </div>
      )}
    </div>
  );
};