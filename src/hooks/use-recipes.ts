import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { useToast } from "./use-toast";

export const useRecipes = () => {
  const { toast } = useToast();
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      // First get the user's current household
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPrivateRecipes([]);
        setPublicRecipes([]);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_household')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      console.log("User profile with current household:", profile);
      const currentHouseholdId = profile?.current_household;
      
      if (currentHouseholdId) {
        // Fetch all household recipes
        const { data: householdRecipes, error: privateError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (tag),
            recipe_ingredients (id, ingredient, amount, unit),
            recipe_steps (id, step_number, description)
          `)
          .eq('household_id', currentHouseholdId)
          .order('created_at', { ascending: false });

        if (privateError) {
          console.error('Error fetching household recipes:', privateError);
          throw privateError;
        }
        console.log("Household recipes fetched:", householdRecipes);
        setPrivateRecipes(householdRecipes || []);
      } else {
        setPrivateRecipes([]);
      }

      // Fetch public recipes
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
      
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Could not load recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    privateRecipes,
    publicRecipes,
    loading,
    refetch: fetchRecipes
  };
};