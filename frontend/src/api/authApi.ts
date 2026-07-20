import { axiosInstance } from './axiosInstance';
import { AuthTokens, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const response = await axiosInstance.post<AuthTokens>('/users/login/', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    await axiosInstance.post('/users/register/', payload);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/users/logout/', { refresh: refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await axiosInstance.post<AuthTokens>('/users/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};
