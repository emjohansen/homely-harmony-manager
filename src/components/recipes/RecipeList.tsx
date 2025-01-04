import { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RecipeFiltersHeader } from "./RecipeFiltersHeader";
import { RecipeSelectedTags } from "./RecipeSelectedTags";
import { TAG_CATEGORIES } from "@/constants/tags";

interface RecipeListProps {
  recipes: Recipe[];
}

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
      <RecipeFiltersHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedTags={selectedTags}
        clearFilters={clearFilters}
      />

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

      <RecipeSelectedTags
        selectedTags={selectedTags}
        toggleTag={toggleTag}
      />

      <div className="grid gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recipes found with selected filters
        </div>
      )}
    </div>
  );
};