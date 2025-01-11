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

        // Fetch all recipes
        const { data: allRecipes, error: recipesError } = await supabase
          .from('recipes')
          .select(`
            *,
            recipe_tags (*),
            recipe_ingredients (*),
            recipe_steps (*)
          `);

        if (recipesError) {
          console.error('Error fetching recipes:', recipesError);
          return;
        }

        console.log('All fetched recipes:', allRecipes);

        if (allRecipes) {
          // Filter private recipes (household recipes)
          const householdRecipes = profile?.current_household 
            ? allRecipes.filter(recipe => 
                recipe.household_id === profile.current_household && !recipe.is_public
              )
            : [];
          
          // Filter public recipes
          const publicRecipesList = allRecipes.filter(recipe => recipe.is_public);

          console.log('Filtered household recipes:', householdRecipes);
          console.log('Filtered public recipes:', publicRecipesList);

          setPrivateRecipes(householdRecipes as Recipe[]);
          setPublicRecipes(publicRecipesList as Recipe[]);
        }
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
  }, [user?.id]);

  return {
    privateRecipes,
    publicRecipes,
    loading,
    refetch: fetchRecipes
  };
};