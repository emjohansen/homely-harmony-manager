import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { RecipeForm } from "@/components/recipes/RecipeForm";

const NewRecipe = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 animate-slide-in-up">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
        <RecipeForm mode="create" />
      </div>
      <Navigation />
    </div>
  );
};

export default NewRecipe;