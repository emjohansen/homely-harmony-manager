import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Plus } from "lucide-react";
import { RecipeBasicInfo } from "@/components/recipes/RecipeBasicInfo";
import { RecipeTags } from "@/components/recipes/RecipeTags";

const NewRecipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
  const [ingredients, setIngredients] = useState<Array<{ ingredient: string; amount: string; unit: string }>>([
    { ingredient: "", amount: "", unit: "" }
  ]);
  const [steps, setSteps] = useState<Array<{ description: string }>>([
    { description: "" }
  ]);

  useEffect(() => {
    const fetchHousehold = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', session.user.id)
        .single();

      console.log("Current household member:", householdMember);
      if (householdMember) {
        setCurrentHouseholdId(householdMember.household_id);
      }
    };

    fetchHousehold();
  }, [navigate]);

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

      console.log("Creating recipe with household_id:", currentHouseholdId);

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title,
          description,
          servings,
          preparation_time: prepTime,
          is_public: isPublic,
          created_by: session.user.id,
          household_id: isPublic ? null : currentHouseholdId // Set household_id only for private recipes
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert tags
      if (tags.length > 0) {
        const { error: tagsError } = await supabase
          .from("recipe_tags")
          .insert(tags.map(tag => ({
            recipe_id: recipe.id,
            tag
          })));

        if (tagsError) throw tagsError;
      }

      // Insert ingredients
      const validIngredients = ingredients.filter(i => i.ingredient.trim());
      if (validIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(validIngredients.map(i => ({
            recipe_id: recipe.id,
            ingredient: i.ingredient,
            amount: i.amount ? parseFloat(i.amount) : null,
            unit: i.unit || null
          })));

        if (ingredientsError) throw ingredientsError;
      }

      // Insert steps
      const validSteps = steps.filter(s => s.description.trim());
      if (validSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from("recipe_steps")
          .insert(validSteps.map((s, index) => ({
            recipe_id: recipe.id,
            step_number: index + 1,
            description: s.description
          })));

        if (stepsError) throw stepsError;
      }

      toast({
        title: "Success",
        description: "Recipe created successfully!",
      });
      navigate("/recipes");
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create recipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
        
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
            {loading ? "Creating..." : "Create Recipe"}
          </Button>
        </form>
      </div>
      <Navigation />
    </div>
  );
};

export default NewRecipe;