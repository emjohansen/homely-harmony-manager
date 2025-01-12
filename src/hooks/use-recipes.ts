import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Recipe } from '@/types/recipe';

export const useRecipes = () => {
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      // First get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      console.log('Fetching recipes for user:', user?.id);
      
      if (user?.id) {
        // Get the user's current household
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_household')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        console.log('User profile:', profile);
        console.log('Current household:', profile?.current_household);

        if (profile?.current_household) {
          // Fetch all recipes for the current household
          const { data: householdRecipes, error: householdRecipesError } = await supabase
            .from('recipes')
            .select(`
              *,
              recipe_tags (*),
              recipe_ingredients (*),
              recipe_steps (*)
            `)
            .eq('household_id', profile.current_household);

          if (householdRecipesError) {
            console.error('Error fetching household recipes:', householdRecipesError);
            return;
          }

          console.log('Household recipes:', householdRecipes);
          setPrivateRecipes(householdRecipes as Recipe[] || []);
        }

        // Fetch public recipes from other households
        const { data: publicRecipesData, error: publicError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (*),
            recipe_ingredients (*),
            recipe_steps (*)
          `)
          .eq('is_public', true)
          .neq('household_id', profile?.current_household || '');

        if (publicError) {
          console.error('Error fetching public recipes:', publicError);
          return;
        }

        console.log('Public recipes:', publicRecipesData);
        setPublicRecipes(publicRecipesData as Recipe[] || []);
      } else {
        // If no user is logged in, only fetch public recipes
        const { data: publicRecipesData, error: publicError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (*),
            recipe_ingredients (*),
            recipe_steps (*)
          `)
          .eq('is_public', true);

        if (publicError) {
          console.error('Error fetching public recipes:', publicError);
          return;
        }

        console.log('Public recipes (no user):', publicRecipesData);
        setPublicRecipes(publicRecipesData as Recipe[] || []);
        setPrivateRecipes([]);
      }
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
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