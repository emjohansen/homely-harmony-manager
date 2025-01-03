import { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { useState } from "react";
import { RecipeFilters } from "./RecipeFilters";

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
    <div className="space-y-6">
      <RecipeFilters
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
      />

      <div className="grid gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 text-palette-medium">
          Ingen oppskrifter funnet med valgte filter
        </div>
      )}
    </div>
  );
};