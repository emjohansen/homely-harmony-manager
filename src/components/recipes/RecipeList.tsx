import { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { useState } from "react";
import { RecipeFilters } from "./filters/RecipeFilters";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface RecipeListProps {
  recipes: Recipe[];
}

export const RecipeList = ({ recipes }: RecipeListProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleRandomRecipe = () => {
    if (filteredRecipes.length === 0) {
      toast({
        title: "No recipes found",
        description: "No recipes found with selected filters",
        variant: "destructive",
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    navigate(`/recipes/${filteredRecipes[randomIndex].id}`);
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tag =>
      recipe.recipe_tags?.some(recipeTag => recipeTag.tag === tag)
    );
  });

  return (
    <div className="space-y-4">
      <RecipeFilters
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        onClearFilters={clearFilters}
        onRandomRecipe={handleRandomRecipe}
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