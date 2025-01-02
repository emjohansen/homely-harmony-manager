import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRecipeOperations } from "@/hooks/use-recipe-operations";

interface RecipeFormSubmitProps {
  mode: 'create' | 'edit';
  recipeId?: string;
  formData: {
    title: string;
    description: string;
    servings: number;
    prepTime: number;
    isPublic: boolean;
    tags: string[];
    ingredients: { ingredient: string; amount: string; unit: string }[];
    steps: { description: string }[];
  };
}

export const useRecipeSubmit = ({ mode, recipeId, formData }: RecipeFormSubmitProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(null);
  const recipeOperations = useRecipeOperations();

  useEffect(() => {
    const fetchHouseholdId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: householdMember } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (householdMember) {
          setCurrentHouseholdId(householdMember.household_id);
        }
      }
    };

    fetchHouseholdId();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      // Validate ingredient amounts
      const invalidIngredients = formData.ingredients.filter(ing => {
        if (!ing.amount) return false; // Empty amount is ok
        return isNaN(parseFloat(ing.amount));
      });

      if (invalidIngredients.length > 0) {
        toast({
          title: "Ugyldig mengde",
          description: "Alle mengder må være tall",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Feil",
          description: "Du må være logget inn for å opprette oppskrifter",
          variant: "destructive",
        });
        return;
      }
      
      if (!currentHouseholdId) {
        toast({
          title: "Feil",
          description: "Du må være medlem av en husholdning for å opprette oppskrifter",
          variant: "destructive",
        });
        return;
      }

      console.log("Submitting recipe with household:", currentHouseholdId);

      const recipeData = {
        title: formData.title,
        description: formData.description,
        servings: formData.servings,
        preparation_time: formData.prepTime,
        is_public: formData.isPublic,
        created_by: session.user.id,
        household_id: currentHouseholdId,
      };

      if (mode === 'create') {
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select()
          .single();

        if (recipeError) {
          console.error('Error creating recipe:', recipeError);
          throw recipeError;
        }

        console.log("Recipe created:", recipe);

        await Promise.all([
          recipeOperations.insertRecipeTags(recipe.id, formData.tags),
          recipeOperations.insertRecipeIngredients(recipe.id, formData.ingredients),
          recipeOperations.insertRecipeSteps(recipe.id, formData.steps)
        ]);

        toast({
          title: "Suksess",
          description: "Oppskrift opprettet!",
        });
        navigate("/recipes");
      } else {
        if (!recipeId) return;

        const { error: recipeError } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq('id', recipeId);

        if (recipeError) {
          console.error('Error updating recipe:', recipeError);
          throw recipeError;
        }

        await recipeOperations.updateRecipeRelations(
          recipeId,
          formData.tags,
          formData.ingredients,
          formData.steps
        );

        toast({
          title: "Suksess",
          description: "Oppskrift oppdatert!",
        });
        navigate(`/recipes/${recipeId}`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Kunne ikke lagre oppskriften",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};