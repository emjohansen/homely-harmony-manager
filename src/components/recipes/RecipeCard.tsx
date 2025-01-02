import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      <h3 className="font-semibold">{recipe.title}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {recipe.preparation_time} mins • {recipe.servings} servings
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {recipe.recipe_tags?.map(({ tag }) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};