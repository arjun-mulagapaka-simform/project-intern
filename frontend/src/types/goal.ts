export type CadenceType = 'daily' | 'weekly' | 'n_times_per_week';

export interface Goal {
  id: number;
  user: number;
  description: string;
  cadence: CadenceType;
  target_count: number | null;
  is_active: boolean;
  created_at: string;
  archived_at: string | null;
}

export interface StreakState {
  goal: string;
  current_streak: number;
  longest_streak: number;
  status: 'active' | 'at-risk' | 'broken';
  last_checkin: string | null;
  updated_at: string;
}

export interface GoalFormData {
  description: string;
  cadence: CadenceType;
  target_count?: number | null;
}
