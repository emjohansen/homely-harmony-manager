import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { RecipeBasicInfo } from "@/components/recipes/RecipeBasicInfo";
import { RecipeTags } from "@/components/recipes/RecipeTags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);

  // Basic info state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(30);
  const [isPublic, setIsPublic] = useState(false);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Ingredients and steps state
  const [ingredients, setIngredients] = useState<Array<{ ingredient: string; amount: string; unit: string }>>([]);
  const [steps, setSteps] = useState<Array<{ description: string }>>([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data: recipe, error } = await supabase
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

        // Set basic info
        setTitle(recipe.title);
        setDescription(recipe.description || "");
        setServings(recipe.servings);
        setPrepTime(recipe.preparation_time || 30);
        setIsPublic(recipe.is_public || false);

        // Set tags
        setTags(recipe.recipe_tags?.map(({ tag }) => tag) || []);

        // Set ingredients
        setIngredients(
          recipe.recipe_ingredients?.map(({ ingredient, amount, unit }) => ({
            ingredient,
            amount: amount?.toString() || "",
            unit: unit || ""
          })) || [{ ingredient: "", amount: "", unit: "" }]
        );

        // Set steps
        setSteps(
          recipe.recipe_steps?.sort((a, b) => a.step_number - b.step_number).map(({ description }) => ({
            description
          })) || [{ description: "" }]
        );

        // Get current household
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: householdMember } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', session.user.id)
            .single();

          if (householdMember) {
            setCurrentHouseholdId(householdMember.household_id);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error",
          description: "Failed to load recipe",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleIngredientChange = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", amount: "", unit: "" }]);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      if (!currentHouseholdId && !isPublic) {
        throw new Error("You must be in a household to create a private recipe");
      }

      // Update recipe
      const { error: recipeError } = await supabase
        .from("recipes")
        .update({
          title,
          description,
          servings,
          preparation_time: prepTime,
          is_public: isPublic,
          household_id: isPublic ? null : currentHouseholdId
        })
        .eq('id', id);

      if (recipeError) throw recipeError;

      // Delete existing tags and insert new ones
      await supabase.from("recipe_tags").delete().eq('recipe_id', id);
      if (tags.length > 0) {
        const { error: tagsError } = await supabase
          .from("recipe_tags")
          .insert(tags.map(tag => ({
            recipe_id: id,
            tag
          })));

        if (tagsError) throw tagsError;
      }

      // Delete existing ingredients and insert new ones
      await supabase.from("recipe_ingredients").delete().eq('recipe_id', id);
      const validIngredients = ingredients.filter(i => i.ingredient.trim());
      if (validIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(validIngredients.map(i => ({
            recipe_id: id,
            ingredient: i.ingredient,
            amount: i.amount ? parseFloat(i.amount) : null,
            unit: i.unit || null
          })));

        if (ingredientsError) throw ingredientsError;
      }

      // Delete existing steps and insert new ones
      await supabase.from("recipe_steps").delete().eq('recipe_id', id);
      const validSteps = steps.filter(s => s.description.trim());
      if (validSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from("recipe_steps")
          .insert(validSteps.map((s, index) => ({
            recipe_id: id,
            step_number: index + 1,
            description: s.description
          })));

        if (stepsError) throw stepsError;
      }

      toast({
        title: "Success",
        description: "Recipe updated successfully!",
      });
      navigate(`/recipes/${id}`);
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update recipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center">Loading recipe...</div>
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
            onClick={() => navigate(`/recipes/${id}`)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Recipe</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RecipeBasicInfo
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            servings={servings}
            setServings={setServings}
            prepTime={prepTime}
            setPrepTime={setPrepTime}
          />

          <RecipeTags
            tags={tags}
            setTags={setTags}
            newTag={newTag}
            setNewTag={setNewTag}
            handleAddTag={handleAddTag}
          />

          <div className="space-y-2">
            <Label>Ingredients</Label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-6 gap-2">
                <Input
                  className="col-span-3"
                  placeholder="Ingredient"
                  value={ingredient.ingredient}
                  onChange={(e) => handleIngredientChange(index, "ingredient", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                />
                <Input
                  className="col-span-1"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Steps</Label>
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="mt-2 text-sm text-gray-500">{index + 1}.</span>
                <Textarea
                  placeholder={`Step ${index + 1}`}
                  value={step.description}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make this recipe public</Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Recipe"}
          </Button>
        </form>
      </div>
      <Navigation />
    </div>
  );
};

export default EditRecipe;