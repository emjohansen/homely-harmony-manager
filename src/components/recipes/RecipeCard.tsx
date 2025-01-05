import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-mint rounded-lg p-4 space-y-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-forest break-words whitespace-pre-wrap">
            {recipe.title.length > 30 ? `${recipe.title.slice(0, 30)}\n${recipe.title.slice(30)}` : recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm text-forest mt-1 line-clamp-2">{recipe.description}</p>
          )}
        </div>
      </div>

      {recipe.image_url && (
        <div className="relative w-full h-48">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <p className="text-sm text-forest">
          {recipe.preparation_time} mins
        </p>
        {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.recipe_tags.map(({ tag }) => (
              <span
                key={tag}
                className="text-xs bg-cream text-forest px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};