export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "chore_assignments_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "chore_completions_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          created_at: string
          created_by: string | null
          custom_frequency: string | null
          description: string | null
          frequency: string | null
          household_id: string | null
          id: string
          is_recurring: boolean | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_frequency?: string | null
          description?: string | null
          frequency?: string | null
          household_id?: string | null
          id?: string
          is_recurring?: boolean | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_frequency?: string | null
          description?: string | null
          frequency?: string | null
          household_id?: string | null
          id?: string
          is_recurring?: boolean | null
          title?: string
        }
        Relationships: []
      }
      household_invites: {
        Row: {
          created_at: string
          email: string
          household_id: string | null
          id: string
          invited_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          household_id?: string | null
          id?: string
          invited_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          household_id?: string | null
          id?: string
          invited_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          household_id: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          household_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          admins: string[] | null
          created_at: string
          created_by: string | null
          custom_stores: string[] | null
          id: string
          members: string[] | null
          name: string
        }
        Insert: {
          admins?: string[] | null
          created_at?: string
          created_by?: string | null
          custom_stores?: string[] | null
          id?: string
          members?: string[] | null
          name: string
        }
        Update: {
          admins?: string[] | null
          created_at?: string
          created_by?: string | null
          custom_stores?: string[] | null
          id?: string
          members?: string[] | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_household: string | null
          households: string[] | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_household?: string | null
          households?: string[] | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_household?: string | null
          households?: string[] | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_household_fkey"
            columns: ["current_household"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_group_items: {
        Row: {
          group_id: string
          recipe_id: string
        }
        Insert: {
          group_id: string
          recipe_id: string
        }
        Update: {
          group_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "recipe_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_groups: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: number | null
          id: string
          ingredient: string
          recipe_id: string | null
          unit: string | null
        }
        Insert: {
          amount?: number | null
          id?: string
          ingredient: string
          recipe_id?: string | null
          unit?: string | null
        }
        Update: {
          amount?: number | null
          id?: string
          ingredient?: string
          recipe_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          description: string
          id: string
          recipe_id: string | null
          step_number: number
        }
        Insert: {
          description: string
          id?: string
          recipe_id?: string | null
          step_number: number
        }
        Update: {
          description?: string
          id?: string
          recipe_id?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          household_id: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          preparation_time: number | null
          servings: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          preparation_time?: number | null
          servings: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_id?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          preparation_time?: number | null
          servings?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "reminder_assignments_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          household_id: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          household_id?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          household_id?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          is_checked: boolean | null
          item: string
          price: number | null
          quantity: number | null
          shopping_list_id: string | null
          store: string | null
          unit: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          is_checked?: boolean | null
          item: string
          price?: number | null
          quantity?: number | null
          shopping_list_id?: string | null
          store?: string | null
          unit?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          is_checked?: boolean | null
          item?: string
          price?: number | null
          quantity?: number | null
          shopping_list_id?: string | null
          store?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "shopping_list_receipts_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          created_by: string | null
          household_id: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          household_id?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          created_by?: string | null
          household_id?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      storage_items: {
        Row: {
          added_by: string | null
          description: string | null
          id: string
          name: string
          storage_unit_id: string | null
          stored_at: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          description?: string | null
          id?: string
          name: string
          storage_unit_id?: string | null
          stored_at?: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          description?: string | null
          id?: string
          name?: string
          storage_unit_id?: string | null
          stored_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_storage_unit_id_fkey"
            columns: ["storage_unit_id"]
            isOneToOne: false
            referencedRelation: "storage_units"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_units: {
        Row: {
          created_at: string
          created_by: string | null
          household_id: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          household_id?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          household_id?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_household_membership: {
        Args: {
          p_user_id: string
          p_household_id: string
        }
        Returns: boolean
      }
      check_user_household_access: {
        Args: {
          recipe_household_id: string
        }
        Returns: boolean
      }
      is_household_member: {
        Args: {
          household_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never