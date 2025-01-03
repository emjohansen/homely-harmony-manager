import { Recipe } from "@/types/recipe";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-palette-light rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-palette-muted/20"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {recipe.image_url && (
        <div className="relative w-full h-48 mb-4">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
          />
        </div>
      )}
      <h3 className="font-semibold text-palette-dark">{recipe.title}</h3>
      {recipe.description && (
        <p className="text-sm text-palette-medium mt-1 line-clamp-2">{recipe.description}</p>
      )}
      <p className="text-sm text-palette-medium mt-2">
        {recipe.preparation_time} mins • {recipe.servings} servings
      </p>
      {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {recipe.recipe_tags.map(({ tag }) => (
            <span
              key={tag}
              className="text-xs bg-palette-muted/30 text-palette-dark px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};