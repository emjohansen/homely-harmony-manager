import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "./use-toast";

export const useRecipes = (householdId: string | null) => {
  const { toast } = useToast();
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      console.log("Fetching recipes for household:", householdId);
      
      if (householdId) {
        // Fetch all household recipes
        const { data: householdRecipes, error: privateError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('household_id', householdId)
          .order('created_at', { ascending: false });

        if (privateError) {
          console.error('Error fetching household recipes:', privateError);
          throw privateError;
        }
        console.log("Household recipes fetched:", householdRecipes);
        setPrivateRecipes(householdRecipes || []);

        // Set public recipes - include all public recipes from any household
        const { data: allPublicRecipes, error: publicError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (publicError) {
          console.error('Error fetching public recipes:', publicError);
          throw publicError;
        }
        console.log("Public recipes fetched:", allPublicRecipes);
        setPublicRecipes(allPublicRecipes || []);
      } else {
        // If no household, only show public recipes
        const { data: publicRecipesData, error: publicError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (publicError) {
          console.error('Error fetching public recipes:', publicError);
          throw publicError;
        }
        setPublicRecipes(publicRecipesData || []);
        setPrivateRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Kunne ikke laste oppskrifter. Vennligst prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [householdId]);

  return {
    privateRecipes,
    publicRecipes,
    loading,
    refetch: fetchRecipes
  };
};