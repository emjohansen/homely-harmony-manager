import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error",
          description: "Failed to load recipe details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  useEffect(() => {
    const checkEditPermissions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && recipe) {
        if (recipe.is_public) {
          setCanEdit(recipe.created_by === session.user.id);
        } else {
          const { data: householdMember } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', session.user.id)
            .eq('household_id', recipe.household_id)
            .single();
          
          setCanEdit(!!householdMember);
        }
      }
    };

    checkEditPermissions();
  }, [recipe]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      navigate("/recipes");
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">Loading recipe details...</div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">Recipe not found</div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/recipes")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/recipes/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {recipe.image_url && (
            <div className="relative w-full h-64 mb-6">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-gray-600 mb-4">{recipe.description}</p>

          <div className="flex gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Servings</span>
              <p className="font-medium">{recipe.servings}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Preparation Time</span>
              <p className="font-medium">{recipe.preparation_time} mins</p>
            </div>
          </div>

          {recipe.recipe_tags && recipe.recipe_tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.recipe_tags.map(({ tag }) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.recipe_ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-baseline">
                    <span className="font-medium mr-2">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                    <span>{ingredient.ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Instructions</h2>
              <ol className="space-y-4">
                {recipe.recipe_steps
                  .sort((a, b) => a.step_number - b.step_number)
                  .map((step) => (
                    <li key={step.id} className="flex">
                      <span className="font-medium mr-4">{step.step_number}.</span>
                      <span>{step.description}</span>
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default RecipeDetails;
