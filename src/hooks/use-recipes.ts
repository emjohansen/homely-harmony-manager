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
      
      // Fetch private (household) recipes
      if (householdId) {
        const { data: privateRecipesData, error: privateError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('household_id', householdId)
          .eq('is_public', false)
          .order('created_at', { ascending: false });

        if (privateError) throw privateError;
        console.log("Private recipes fetched:", privateRecipesData);
        setPrivateRecipes(privateRecipesData || []);
      }

      // Fetch public recipes
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

      if (publicError) throw publicError;
      console.log("Public recipes fetched:", publicRecipesData);
      setPublicRecipes(publicRecipesData || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes",
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