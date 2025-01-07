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

// Auth functions
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

// Household functions
export const households = {
  getAll: async (): Promise<Household[]> => {
    return JSON.parse(localStorage.getItem(KEYS.HOUSEHOLDS) || '[]');
  },

  create: async (name: string): Promise<Household> => {
    const user = auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const household: Household = {
      id: generateId(),
      name,
      created_by: user.id,
      created_at: getCurrentTimestamp(),
    };

    const households = await households.getAll();
    households.push(household);
    localStorage.setItem(KEYS.HOUSEHOLDS, JSON.stringify(households));

    // Add creator as admin member
    const member: HouseholdMember = {
      household_id: household.id,
      user_id: user.id,
      role: 'admin',
      joined_at: getCurrentTimestamp(),
    };
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    members.push(member);
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));

    return household;
  },

  delete: async (id: string): Promise<void> => {
    const households = await households.getAll();
    const filtered = households.filter(h => h.id !== id);
    localStorage.setItem(KEYS.HOUSEHOLDS, JSON.stringify(filtered));

    // Clean up related data
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const filteredMembers = members.filter((m: HouseholdMember) => m.household_id !== id);
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(filteredMembers));

    const invites = JSON.parse(localStorage.getItem(KEYS.INVITES) || '[]');
    const filteredInvites = invites.filter((i: HouseholdInvite) => i.household_id !== id);
    localStorage.setItem(KEYS.INVITES, JSON.stringify(filteredInvites));

    const recipes = JSON.parse(localStorage.getItem(KEYS.RECIPES) || '[]');
    const filteredRecipes = recipes.filter((r: Recipe) => r.household_id !== id);
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(filteredRecipes));
  },
};

// Members functions
export const members = {
  getByHousehold: async (householdId: string): Promise<HouseholdMember[]> => {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    return members.filter((m: HouseholdMember) => m.household_id === householdId);
  },

  remove: async (householdId: string, userId: string): Promise<void> => {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const filtered = members.filter(
      (m: HouseholdMember) => !(m.household_id === householdId && m.user_id === userId)
    );
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(filtered));
  },
};

// Invites functions
export const invites = {
  getByEmail: async (email: string): Promise<HouseholdInvite[]> => {
    const invites = JSON.parse(localStorage.getItem(KEYS.INVITES) || '[]');
    return invites.filter((i: HouseholdInvite) => i.email === email);
  },

  create: async (householdId: string, email: string): Promise<HouseholdInvite> => {
    const user = auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const invite: HouseholdInvite = {
      id: generateId(),
      household_id: householdId,
      email,
      status: 'pending',
      invited_by: user.id,
      created_at: getCurrentTimestamp(),
    };

    const invites = JSON.parse(localStorage.getItem(KEYS.INVITES) || '[]');
    invites.push(invite);
    localStorage.setItem(KEYS.INVITES, JSON.stringify(invites));

    return invite;
  },

  update: async (id: string, status: 'accepted' | 'denied'): Promise<void> => {
    const invites = JSON.parse(localStorage.getItem(KEYS.INVITES) || '[]');
    const updated = invites.map((i: HouseholdInvite) =>
      i.id === id ? { ...i, status } : i
    );
    localStorage.setItem(KEYS.INVITES, JSON.stringify(updated));
  },
};

// Recipe functions
export const recipes = {
  getAll: async (): Promise<Recipe[]> => {
    return JSON.parse(localStorage.getItem(KEYS.RECIPES) || '[]');
  },

  create: async (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> => {
    const user = auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };

    const recipes = await recipes.getAll();
    recipes.push(newRecipe);
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));

    return newRecipe;
  },

  update: async (id: string, updates: Partial<Recipe>): Promise<Recipe> => {
    const recipes = await recipes.getAll();
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

  delete: async (id: string): Promise<void> => {
    const recipes = await recipes.getAll();
    const filtered = recipes.filter((r: Recipe) => r.id !== id);
    localStorage.setItem(KEYS.RECIPES, JSON.stringify(filtered));
  },
};

// Profile functions
export const profiles = {
  update: async (userId: string, updates: Partial<User>): Promise<User> => {
    const user = auth.getUser();
    if (!user || user.id !== userId) throw new Error('Not authenticated');

    const updatedUser = { ...user, ...updates };
    localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
    return updatedUser;
  },
};