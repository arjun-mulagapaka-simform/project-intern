import { axiosInstance } from './axiosInstance';
import { Goal, GoalFormData, StreakState } from '../types/goal';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const goalsApi = {
  getGoals: async (params?: { is_active?: boolean; user?: string }): Promise<Goal[]> => {
    const response = await axiosInstance.get<Goal[] | PaginatedResponse<Goal>>('/goals/', { params });

    // Handle plain array response or DRF PageNumberPagination object response defensively
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray((response.data as PaginatedResponse<Goal>).results)) {
      return (response.data as PaginatedResponse<Goal>).results;
    }
    return [];
  },

  getGoalStreak: async (goalId: number): Promise<StreakState> => {
    const response = await axiosInstance.get<StreakState>(`/goals/${goalId}/streak`);
    return response.data;
  },

  createGoal: async (payload: GoalFormData): Promise<Goal> => {
    const response = await axiosInstance.post<Goal>('/goals/', payload);
    return response.data;
  },

  updateGoal: async (id: number, payload: Partial<GoalFormData>): Promise<Goal> => {
    const response = await axiosInstance.patch<Goal>(`/goals/${id}/`, payload);
    return response.data;
  },

  archiveGoal: async (id: number): Promise<void> => {
    // Soft archive via DELETE endpoint in backend (perform_destroy sets is_active=False)
    await axiosInstance.delete(`/goals/${id}/`);
  },

  reactivateGoal: async (id: number): Promise<Goal> => {
    // Reactivate goal via PATCH /api/goals/<id>/reactivate/ (pending backend activation)
    const response = await axiosInstance.patch<Goal>(`/goals/${id}/reactivate/`);
    return response.data;
  },
};
