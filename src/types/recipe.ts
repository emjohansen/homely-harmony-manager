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
  updated_at: string;
  image_url: string | null;
  recipe_tags?: { tag: string }[];
  recipe_ingredients?: {
    id: string;
    ingredient: string;
    amount: number | null;
    unit: string | null;
  }[];
  recipe_steps?: {
    id: string;
    step_number: number;
    description: string;
  }[];
}