import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '../api/goalsApi';
import { GoalFormData } from '../types/goal';
import { useAuth } from './useAuth';

export const useGoals = (isActive?: boolean) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['goals', { isActive }],
    queryFn: () => goalsApi.getGoals(isActive !== undefined ? { is_active: isActive } : undefined),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGoalStreak = (goalId: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['goalStreak', goalId],
    queryFn: () => goalsApi.getGoalStreak(goalId),
    enabled: isAuthenticated && !!goalId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalFormData) => goalsApi.createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<GoalFormData> }) =>
      goalsApi.updateGoal(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goalStreak', variables.id] });
    },
  });
};

export const useArchiveGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => goalsApi.archiveGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useReactivateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => goalsApi.reactivateGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};
