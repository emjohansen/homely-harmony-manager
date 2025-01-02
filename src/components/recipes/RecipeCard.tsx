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
      {recipe.image_url && (
        <div className="relative w-full h-48 mb-4">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      )}
      <h3 className="font-semibold">{recipe.title}</h3>
      {recipe.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
      )}
      <p className="text-sm text-gray-500 mt-2">
        {recipe.preparation_time} mins • {recipe.servings} servings
      </p>
      {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.recipe_tags.map(({ tag }) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};