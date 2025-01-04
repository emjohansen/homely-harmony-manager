import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { RecipeForm } from "@/components/recipes/RecipeForm";

const NewRecipe = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-lg mx-auto px-4 py-8 relative">
        <img 
          src="/lovable-uploads/3024f919-2334-4e65-8f2a-a7d3e3a536da.png"
          alt=""
          className="absolute top-0 -left-4 -right-4 w-[calc(100%+2rem)] h-32 object-cover z-0"
        />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
          <RecipeForm mode="create" />
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default NewRecipe;