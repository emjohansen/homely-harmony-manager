import { Recipe } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
}

export const RecipeList = ({ recipes }: RecipeListProps) => (
  <div className="grid gap-4">
    {recipes.map((recipe) => (
      <RecipeCard key={recipe.id} recipe={recipe} />
    ))}
  </div>
);