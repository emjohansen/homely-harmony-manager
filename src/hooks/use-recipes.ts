import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import type { Recipe } from '@/types/recipe';

export const useRecipes = () => {
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecipes = async () => {
    try {
      console.log('Fetching recipes for user:', user?.id);
      
      if (user?.id) {
        // First get the user's current household
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single();

        console.log('User profile:', profile);

        // Fetch recipes based on household_id and public status
        const { data: allRecipes, error } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (*),
            recipe_ingredients (*),
            recipe_steps (*)
          `);

        if (error) throw error;

        if (allRecipes) {
          // Filter private recipes (household recipes)
          const householdRecipes = profile?.current_household 
            ? allRecipes.filter(recipe => recipe.household_id === profile.current_household)
            : [];
          
          // Filter public recipes
          const publicRecipesList = allRecipes.filter(recipe => recipe.is_public);

          console.log('Household recipes:', householdRecipes);
          console.log('Public recipes:', publicRecipesList);

          setPrivateRecipes(householdRecipes as Recipe[]);
          setPublicRecipes(publicRecipesList as Recipe[]);
        }
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user?.id]);

  return {
    privateRecipes,
    publicRecipes,
    loading,
    refetch: fetchRecipes
  };
};