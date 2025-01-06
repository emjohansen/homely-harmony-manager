export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          current_household: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          current_household?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          current_household?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      household_invites: {
        Row: {
          id: string
          household_id: string | null
          email: string
          status: string
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id?: string | null
          email: string
          status?: string
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          email?: string
          status?: string
          invited_by?: string | null
          created_at?: string
        }
      }
      households: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          custom_stores: string[] | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          custom_stores?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string
          custom_stores?: string[] | null
        }
      }
      household_members: {
        Row: {
          household_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          household_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          household_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          household_id: string | null
          status: string | null
          archived_at: string | null
          archived_by: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          household_id?: string | null
          status?: string | null
          archived_at?: string | null
          archived_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string
          household_id?: string | null
          status?: string | null
          archived_at?: string | null
          archived_by?: string | null
        }
      }
      shopping_list_items: {
        Row: {
          id: string
          item: string
          quantity: number | null
          store: string | null
          added_at: string
          added_by: string | null
          is_checked: boolean | null
          price: number | null
          shopping_list_id: string | null
          unit: string | null
        }
        Insert: {
          id?: string
          item: string
          quantity?: number | null
          store?: string | null
          added_at?: string
          added_by?: string | null
          is_checked?: boolean | null
          price?: number | null
          shopping_list_id?: string | null
          unit?: string | null
        }
        Update: {
          id?: string
          item?: string
          quantity?: number | null
          store?: string | null
          added_at?: string
          added_by?: string | null
          is_checked?: boolean | null
          price?: number | null
          shopping_list_id?: string | null
          unit?: string | null
        }
      }
      shopping_list_receipts: {
        Row: {
          id: string
          image_url: string
          shopping_list_id: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          image_url: string
          shopping_list_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          shopping_list_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          servings: number
          preparation_time: number | null
          is_public: boolean | null
          created_by: string | null
          household_id: string | null
          created_at: string
          updated_at: string
          image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          servings: number
          preparation_time?: number | null
          is_public?: boolean | null
          created_by?: string | null
          household_id?: string | null
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          servings?: number
          preparation_time?: number | null
          is_public?: boolean | null
          created_by?: string | null
          household_id?: string | null
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
      }
      recipe_tags: {
        Row: {
          recipe_id: string
          tag: string
        }
        Insert: {
          recipe_id: string
          tag: string
        }
        Update: {
          recipe_id?: string
          tag?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string | null
          ingredient: string
          amount: number | null
          unit: string | null
        }
        Insert: {
          id?: string
          recipe_id?: string | null
          ingredient: string
          amount?: number | null
          unit?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string | null
          ingredient?: string
          amount?: number | null
          unit?: string | null
        }
      }
      recipe_steps: {
        Row: {
          id: string
          recipe_id: string | null
          step_number: number
          description: string
        }
        Insert: {
          id?: string
          recipe_id?: string | null
          step_number: number
          description: string
        }
        Update: {
          id?: string
          recipe_id?: string | null
          step_number?: number
          description?: string
        }
      }
      chores: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          created_by: string | null
          frequency: string | null
          custom_frequency: string | null
          is_recurring: boolean | null
          household_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          created_by?: string | null
          frequency?: string | null
          custom_frequency?: string | null
          is_recurring?: boolean | null
          household_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          created_by?: string | null
          frequency?: string | null
          custom_frequency?: string | null
          is_recurring?: boolean | null
          household_id?: string | null
        }
      }
      chore_assignments: {
        Row: {
          chore_id: string
          user_id: string
        }
        Insert: {
          chore_id: string
          user_id: string
        }
        Update: {
          chore_id?: string
          user_id?: string
        }
      }
      chore_completions: {
        Row: {
          chore_id: string | null
          completed_at: string
          completed_by: string | null
          id: string
        }
        Insert: {
          chore_id?: string | null
          completed_at?: string
          completed_by?: string | null
          id?: string
        }
        Update: {
          chore_id?: string | null
          completed_at?: string
          completed_by?: string | null
          id?: string
        }
      }
      reminders: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          household_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          household_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          household_id?: string | null
        }
      }
      reminder_assignments: {
        Row: {
          reminder_id: string
          user_id: string
        }
        Insert: {
          reminder_id: string
          user_id: string
        }
        Update: {
          reminder_id?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_household_membership: {
        Args: { p_user_id: string; p_household_id: string }
        Returns: boolean
      }
      check_user_household_access: {
        Args: { recipe_household_id: string }
        Returns: boolean
      }
      is_household_member: {
        Args: { household_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
