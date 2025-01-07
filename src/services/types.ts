export interface User {
  id: string;
  email: string;
  username: string;
  current_household: string | null;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  preparation_time: number;
  is_public: boolean;
  household_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  recipe_tags: { tag: string }[];
  recipe_ingredients: {
    id: string;
    ingredient: string;
    amount: number | null;
    unit: string | null;
  }[];
  recipe_steps: {
    id: string;
    step_number: number;
    description: string;
  }[];
}