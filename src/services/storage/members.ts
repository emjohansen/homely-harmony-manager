import { HouseholdMember } from '../types';

const STORAGE_KEY = 'household_members';

export const members = {
  getByHousehold: async (householdId: string): Promise<HouseholdMember[]> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allMembers: HouseholdMember[] = stored ? JSON.parse(stored) : [];
    return allMembers.filter(member => member.household_id === householdId);
  },

  create: async (member: HouseholdMember): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allMembers: HouseholdMember[] = stored ? JSON.parse(stored) : [];
    allMembers.push(member);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMembers));
  },

  delete: async (householdId: string, userId: string): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allMembers: HouseholdMember[] = stored ? JSON.parse(stored) : [];
    const filtered = allMembers.filter(
      m => !(m.household_id === householdId && m.user_id === userId)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};