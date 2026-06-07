import api from "@/lib/api";
import config from "@/config";
import { API } from "@/constants/api.constants";

import type {
  AuthUser,
  ChangePasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";
import type { GetMeResponse } from "@/types/user.types";

export const authService = {
  // --- OAuth Links ---
  getGoogleUrl: () => `${config.apiUrl}${API.AUTH.GOOGLE}`,
  getGithubUrl: () => `${config.apiUrl}${API.AUTH.GITHUB}`,

  // --- Standard Auth ---
  login: async (data: LoginCredentials): Promise<AuthUser> => {
    const response = await api.post(API.AUTH.LOGIN, data);
    return response.data;
  },

  signup: async (data: RegisterCredentials): Promise<AuthUser> => {
    const response = await api.post(API.AUTH.REGISTER, data);
    return response.data;
  },

  logout: async () => {
    await api.post(API.AUTH.LOGOUT);
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await api.get(API.AUTH.ME);
    return response.data;
  },

  // --- Password Recovery ---
  requestPasswordReset: async (email: string) => {
    const response = await api.post(API.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(API.AUTH.RESET_PASSWORD(token), { password });
    return response.data;
  },

  unlinkOAuthProvider: async (provider: "google" | "github") => {
    const response = await api.post(API.AUTH.UNLINK, { provider }, { withCredentials: true });
    return response.data;
  },

  deleteAccountApi: async (password: string) => {
    const response = await api.delete(API.AUTH.DELETE_ACCOUNT, {
      data: { password },
      withCredentials: true,
    });
    return response.data;
  },

  setInitialPasswordApi: async (password: string) => {
    const response = await api.post(API.AUTH.SET_INITIAL_PASSWORD, { password }, { withCredentials: true });
    return response.data;
  },

  changePasswordApi: async (passwords: ChangePasswordCredentials) => {
    const response = await api.post(API.AUTH.CHANGE_PASSWORD, passwords, { withCredentials: true });
    return response.data;
  },
};
