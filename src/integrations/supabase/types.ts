import { Database as DatabaseGenerated } from './types.generated';

// Re-export the Database type
export type Database = DatabaseGenerated;

// Export commonly used types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Profile-related types
export type Profile = Tables<'profiles'>;
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Household-related types
export type Household = Tables<'households'>;
export type HouseholdMember = Tables<'household_members'>;
export type HouseholdInvite = Tables<'household_invites'>;

// Recipe-related types
export type Recipe = Tables<'recipes'>;
export type RecipeIngredient = Tables<'recipe_ingredients'>;
export type RecipeStep = Tables<'recipe_steps'>;
export type RecipeTag = Tables<'recipe_tags'>;

// Shopping-related types
export type ShoppingList = Tables<'shopping_lists'>;
export type ShoppingListItem = Tables<'shopping_list_items'>;
export type ShoppingListReceipt = Tables<'shopping_list_receipts'>;

// Storage-related types
export type StorageUnit = Tables<'storage_units'>;
export type StorageItem = Tables<'storage_items'>;

// Chore-related types
export type Chore = Tables<'chores'>;
export type ChoreAssignment = Tables<'chore_assignments'>;
export type ChoreCompletion = Tables<'chore_completions'>;

// Reminder-related types
export type Reminder = Tables<'reminders'>;
export type ReminderAssignment = Tables<'reminder_assignments'>;