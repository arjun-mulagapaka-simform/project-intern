import { axiosInstance } from './axiosInstance';
import { PublicUserProfile, UpdateProfilePayload, User } from '../types/user';

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/users/me/');
    return response.data;
  },

  getPublicProfile: async (username: string): Promise<PublicUserProfile> => {
    const response = await axiosInstance.get<PublicUserProfile>(`/users/${username}/`);
    return response.data;
  },

  updateMe: async (payload: UpdateProfilePayload): Promise<User> => {
    const formData = new FormData();
    if (payload.first_name !== undefined) formData.append('first_name', payload.first_name);
    if (payload.last_name !== undefined) formData.append('last_name', payload.last_name);
    if (payload.bio !== undefined) formData.append('bio', payload.bio);
    if (payload.avatar) formData.append('avatar', payload.avatar);

    const response = await axiosInstance.patch<User>('/users/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
