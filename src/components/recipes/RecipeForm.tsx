import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecipeBasicInfo } from "./RecipeBasicInfo";
import { RecipeTags } from "./RecipeTags";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeSteps } from "./RecipeSteps";
import { RecipeVisibility } from "./RecipeVisibility";
import { RecipeImageUpload } from "./RecipeImageUpload";
import { useRecipeSubmit } from "./RecipeFormSubmit";
import { Loader2 } from "lucide-react";

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  recipeId?: string;
}

export const RecipeForm = ({ mode, initialData, recipeId }: RecipeFormProps) => {
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [servings, setServings] = useState(initialData?.servings || 4);
  const [prepTime, setPrepTime] = useState(initialData?.preparation_time || 30);
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || null);
  const [tags, setTags] = useState<string[]>(initialData?.recipe_tags?.map((t: any) => t.tag) || []);
  const [newTag, setNewTag] = useState("");
  const [ingredients, setIngredients] = useState(
    initialData?.recipe_ingredients || [{ ingredient: "", amount: "", unit: "" }]
  );
  const [steps, setSteps] = useState(
    initialData?.recipe_steps || [{ description: "" }]
  );

  const formData = {
    title,
    description,
    servings,
    prepTime,
    isPublic,
    imageUrl,
    tags,
    ingredients,
    steps
  };

  const { handleSubmit, isSubmitting } = useRecipeSubmit({ 
    mode, 
    recipeId, 
    formData, 
    currentHouseholdId 
  });

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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'create' ? "Oppretter..." : "Oppdaterer..."}
          </>
        ) : (
          mode === 'create' ? "Opprett oppskrift" : "Oppdater oppskrift"
        )}
      </Button>
    </form>
  );
};