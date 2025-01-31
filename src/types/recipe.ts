export interface Recipe {
  id: string;
  household_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  servings: number;
  preparation_time: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
  image_url: string | null;
  recipe_tags?: RecipeTag[];
  recipe_ingredients?: RecipeIngredient[];
  recipe_steps?: RecipeStep[];
}

export interface RecipeTag {
  tag: string;
}

export interface RecipeIngredient {
  id: string;
  ingredient: string;
  amount: number | null;  // Changed from string to number | null to match database
  unit: string | null;
  recipe_id?: string | null; // Added to match database structure
}

export interface RecipeStep {
  id: string;
  step_number: number;
  description: string;
}