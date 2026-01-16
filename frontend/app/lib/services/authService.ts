import api from "@/app/lib/api";
import {
  AuthUser,
  ChangePasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
} from "@/app/types/auth";
import { GetMeResponse } from "@/app/types/userData";

export const authService = {
  // --- OAuth Links ---
  getGoogleUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
  getGithubUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,

  // --- Standard Auth ---
  login: async (data: LoginCredentials): Promise<AuthUser> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  signup: async (data: RegisterCredentials): Promise<AuthUser> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // --- Password Recovery ---
  requestPasswordReset: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  unlinkOAuthProvider: async (provider: "google" | "github") => {
    const response = await api.post(
      "/auth/unlink",
      { provider },
      { withCredentials: true }
    );
    return response.data;
  },

  deleteAccountApi: async (password: string) => {
    const response = await api.delete("/auth/delete-account", {
      data: { password },
      withCredentials: true,
    });
    return response.data;
  },
  setInitialPasswordApi: async (password: string) => {
    // We use withCredentials to send the accessToken cookie
    const response = await api.post(
      `/auth/set-initial-password`,
      { password },
      { withCredentials: true }
    );
    return response.data;
  },

  changePasswordApi: async (passwords: ChangePasswordCredentials) => {
    const response = await api.post("/auth/change-password", passwords, {
      withCredentials: true,
    });
    return response.data;
  },
};
