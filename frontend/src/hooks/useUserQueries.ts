import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { UpdateProfilePayload } from '../types/user';
import { useAuth } from './useAuth';

export const useMyProfile = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePublicProfile = (username: string) => {
  return useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => userApi.getPublicProfile(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateMe(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(['me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
