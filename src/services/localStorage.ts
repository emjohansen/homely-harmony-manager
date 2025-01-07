// Type definitions
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

export interface HouseholdInvite {
  id: string;
  household_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'denied';
  invited_by: string;
  created_at: string;
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

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const getCurrentTimestamp = () => new Date().toISOString();

// Local storage keys
const KEYS = {
  USER: 'user',
  HOUSEHOLDS: 'households',
  MEMBERS: 'household_members',
  INVITES: 'household_invites',
  RECIPES: 'recipes',
};

// Initialize local storage with default values if empty
const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USER)) {
    localStorage.setItem(KEYS.USER, JSON.stringify(null));
  }
  if (!localStorage.getItem(KEYS.HOUSEHOLDS)) {
    localStorage.setItem(KEYS.HOUSEHOLDS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MEMBERS)) {
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.INVITES)) {
    localStorage.setItem(KEYS.INVITES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.RECIPES)) {
    localStorage.setItem(KEYS.RECIPES, JSON.stringify([]));
  }
};

// Initialize storage on import
initializeStorage();

// Storage service implementations
const storageService = {
  getHouseholds: async (): Promise<Household[]> => {
    return JSON.parse(localStorage.getItem(KEYS.HOUSEHOLDS) || '[]');
  },

  createHousehold: async (name: string, userId: string): Promise<Household> => {
    const household: Household = {
      id: generateId(),
      name,
      created_by: userId,
      created_at: getCurrentTimestamp(),
    };

    const households = await storageService.getHouseholds();
    households.push(household);
    localStorage.setItem(KEYS.HOUSEHOLDS, JSON.stringify(households));

    return household;
  },

  deleteHousehold: async (id: string): Promise<void> => {
    const households = await storageService.getHouseholds();
    const filtered = households.filter(h => h.id !== id);
    localStorage.setItem(KEYS.HOUSEHOLDS, JSON.stringify(filtered));
  },

  getRecipes: async (): Promise<Recipe[]> => {
    return JSON.parse(localStorage.getItem(KEYS.RECIPES) || '[]');
  },

  createRecipe: async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> => {
    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };

    const recipes = await storageService.getRecipes();
    recipes.push(newRecipe);
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));

    return newRecipe;
  },

  updateRecipe: async (id: string, updates: Partial<Recipe>): Promise<Recipe> => {
    const recipes = await storageService.getRecipes();
    const updated = recipes.map((r: Recipe) =>
      r.id === id
        ? {
            ...r,
            ...updates,
            updated_at: getCurrentTimestamp(),
          }
        : r
    );
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(updated));
    return updated.find((r: Recipe) => r.id === id)!;
  },

  deleteRecipe: async (id: string): Promise<void> => {
    const recipes = await storageService.getRecipes();
    const filtered = recipes.filter((r: Recipe) => r.id !== id);
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(filtered));
  }
};

// Export the services
export const auth = {
  getUser: (): User | null => {
    return JSON.parse(localStorage.getItem(KEYS.USER) || 'null');
  },

  signIn: async (email: string): Promise<User> => {
    const user: User = {
      id: generateId(),
      email,
      username: email.split('@')[0],
      current_household: null,
    };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },

  signOut: async () => {
    localStorage.setItem(KEYS.USER, JSON.stringify(null));
  },
};

export const households = {
  getAll: storageService.getHouseholds,
  create: storageService.createHousehold,
  delete: storageService.deleteHousehold,
};

export const recipes = {
  getAll: storageService.getRecipes,
  create: storageService.createRecipe,
  update: storageService.updateRecipe,
  delete: storageService.deleteRecipe,
};

export const profiles = {
  update: async (userId: string, updates: Partial<User>): Promise<User> => {
    const user = auth.getUser();
    if (!user || user.id !== userId) throw new Error('Not authenticated');

    const updatedUser = { ...user, ...updates };
    localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
    return updatedUser;
  },
};