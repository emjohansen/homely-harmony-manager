import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { X, Plus } from "lucide-react";

const NewRecipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(30);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [ingredients, setIngredients] = useState<Array<{ ingredient: string; amount: string; unit: string }>>([
    { ingredient: "", amount: "", unit: "" }
  ]);
  const [steps, setSteps] = useState<Array<{ description: string }>>([
    { description: "" }
  ]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", amount: "", unit: "" }]);
  };

  const handleIngredientChange = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title,
          description,
          servings,
          preparation_time: prepTime,
          is_public: isPublic,
          created_by: session.user.id
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
        description: "Failed to create recipe",
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
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Preparation Time (mins)</Label>
              <Input
                id="prepTime"
                type="number"
                min="1"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type a tag and press Enter"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>

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