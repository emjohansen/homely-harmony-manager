import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecipeBasicInfo } from "./RecipeBasicInfo";
import { RecipeTags } from "./RecipeTags";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeSteps } from "./RecipeSteps";
import { RecipeVisibility } from "./RecipeVisibility";
import { RecipeImageUpload } from "./RecipeImageUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  recipeId?: string;
}

export const RecipeForm = ({ mode, initialData, recipeId }: RecipeFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [servings, setServings] = useState(initialData?.servings || 4);
  const [prepTime, setPrepTime] = useState(initialData?.preparation_time || 30);
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || null);
  const [tags, setTags] = useState<string[]>(initialData?.recipe_tags?.map((t: any) => t.tag) || []);
  const [newTag, setNewTag] = useState("");
  const [ingredients, setIngredients] = useState(
    initialData?.recipe_ingredients || [{ ingredient: "", amount: "", unit: "" }]
  );
  const [steps, setSteps] = useState(
    initialData?.recipe_steps || [{ description: "" }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const recipeData = {
        title,
        description,
        servings,
        preparation_time: prepTime,
        is_public: isPublic,
        created_by: session.user.id,
        household_id: isPublic ? null : currentHouseholdId,
        image_url: imageUrl
      };

      if (mode === 'create') {
        // Create recipe logic
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select()
          .single();

        if (recipeError) throw recipeError;

        // Create private copy if public
        if (isPublic && currentHouseholdId) {
          const privateRecipeData = {
            ...recipeData,
            is_public: false,
            household_id: currentHouseholdId
          };
          await supabase.from("recipes").insert(privateRecipeData);
        }

        // Insert related data
        await Promise.all([
          // Insert tags
          tags.length > 0 && supabase
            .from("recipe_tags")
            .insert(tags.map(tag => ({
              recipe_id: recipe.id,
              tag
            }))),

          // Insert ingredients
          ingredients.filter(i => i.ingredient.trim()).length > 0 && supabase
            .from("recipe_ingredients")
            .insert(ingredients.filter(i => i.ingredient.trim()).map(i => ({
              recipe_id: recipe.id,
              ingredient: i.ingredient,
              amount: i.amount ? parseFloat(i.amount) : null,
              unit: i.unit || null
            }))),

          // Insert steps
          steps.filter(s => s.description.trim()).length > 0 && supabase
            .from("recipe_steps")
            .insert(steps.filter(s => s.description.trim()).map((s, index) => ({
              recipe_id: recipe.id,
              step_number: index + 1,
              description: s.description
            })))
        ]);

        toast({
          title: "Success",
          description: "Recipe created successfully!",
        });
        navigate("/recipes");
      } else {
        // Update recipe logic
        const { error: recipeError } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq('id', recipeId);

        if (recipeError) throw recipeError;

        // Update related data
        await Promise.all([
          // Update tags
          supabase.from("recipe_tags").delete().eq('recipe_id', recipeId),
          tags.length > 0 && supabase
            .from("recipe_tags")
            .insert(tags.map(tag => ({
              recipe_id: recipeId,
              tag
            }))),

          // Update ingredients
          supabase.from("recipe_ingredients").delete().eq('recipe_id', recipeId),
          ingredients.filter(i => i.ingredient.trim()).length > 0 && supabase
            .from("recipe_ingredients")
            .insert(ingredients.filter(i => i.ingredient.trim()).map(i => ({
              recipe_id: recipeId,
              ingredient: i.ingredient,
              amount: i.amount ? parseFloat(i.amount) : null,
              unit: i.unit || null
            }))),

          // Update steps
          supabase.from("recipe_steps").delete().eq('recipe_id', recipeId),
          steps.filter(s => s.description.trim()).length > 0 && supabase
            .from("recipe_steps")
            .insert(steps.filter(s => s.description.trim()).map((s, index) => ({
              recipe_id: recipeId,
              step_number: index + 1,
              description: s.description
            })))
        ]);

        toast({
          title: "Success",
          description: "Recipe updated successfully!",
        });
        navigate(`/recipes/${recipeId}`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save recipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RecipeImageUpload
        imageUrl={imageUrl}
        onImageUpload={setImageUrl}
      />

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

      <RecipeVisibility
        isPublic={isPublic}
        setIsPublic={setIsPublic}
      />

      <RecipeTags
        tags={tags}
        setTags={setTags}
        newTag={newTag}
        setNewTag={setNewTag}
        handleAddTag={(e) => {
          if (e.key === "Enter" && newTag.trim()) {
            e.preventDefault();
            if (!tags.includes(newTag.trim())) {
              setTags([...tags, newTag.trim()]);
            }
            setNewTag("");
          }
        }}
      />

      <RecipeIngredients
        ingredients={ingredients}
        setIngredients={setIngredients}
      />

      <RecipeSteps
        steps={steps}
        setSteps={setSteps}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (mode === 'create' ? "Creating..." : "Updating...") : (mode === 'create' ? "Create Recipe" : "Update Recipe")}
      </Button>
    </form>
  );
};