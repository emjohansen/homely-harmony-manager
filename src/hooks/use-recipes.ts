import { useState, useEffect } from 'react';
import { recipes } from '@/services/localStorage';
import { useAuth } from './use-auth';
import type { Recipe } from '@/services/localStorage';

export const useRecipes = () => {
  const [privateRecipes, setPrivateRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecipes = async () => {
    try {
      const allRecipes = await recipes.getAll();
      
      if (user?.current_household) {
        const householdRecipes = allRecipes.filter(
          recipe => recipe.household_id === user.current_household
        );
        setPrivateRecipes(householdRecipes);
      } else {
        setPrivateRecipes([]);
      }

      const publicRecipesList = allRecipes.filter(recipe => recipe.is_public);
      setPublicRecipes(publicRecipesList);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user?.current_household]);

  return {
    privateRecipes,
    publicRecipes,
    loading,
    refetch: fetchRecipes
  };
};