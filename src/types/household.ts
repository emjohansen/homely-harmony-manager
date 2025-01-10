export interface Member {
  id: string;
  household_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  username?: string; // Added to support the UI requirements
}

export interface Invite {
  id: string;
  household_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members: string[];
  admins: string[];
}

export type HouseholdRole = 'admin' | 'member';

export interface HouseholdMembersListProps {
  householdId: string;
  isAdmin: boolean;
}