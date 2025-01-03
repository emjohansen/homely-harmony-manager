import { Recipe } from "@/types/recipe";

interface RecipeHeroProps {
  recipe: Recipe;
}

export const RecipeHero = ({ recipe }: RecipeHeroProps) => {
  return (
    <div className="relative">
      {recipe.image_url ? (
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h1 className="text-4xl font-bold text-white mb-2">{recipe.title}</h1>
            <p className="text-gray-200 text-lg mb-3">{recipe.description}</p>
            {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.recipe_tags.map(({ tag }) => (
                  <span
                    key={tag}
                    className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
          <p className="text-gray-600 text-lg mb-3">{recipe.description}</p>
          {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.recipe_tags.map(({ tag }) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};