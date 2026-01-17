import { createAsyncThunk } from "@reduxjs/toolkit";

import { authService } from "@/lib/services/auth.service";
import { userService } from "@/lib/services/user.service";
import { handleAxiosError } from "@/utils/axios-error.util";

import type {
  ChangePasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";

/**
 * AUTHENTICATION--------------------------------------------------
 */
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      return await authService.signup(data);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Registration failed"));
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authService.login(data);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Login failed"));
    }
  }
);

/**
 * USER MANAGEMENT -----------------------------------------------------------
 */
export const updateThunk = createAsyncThunk(
  "auth/updateUser",
  async (
    { userId, data }: { userId: number; data: FormData },
    { rejectWithValue }
  ) => {
    try {
      return await userService.updateProfile(userId, data);
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error, "Failed to update profile")
      );
    }
  }
);

export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Session expired"));
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Logout failed"));
    }
  }
);
/**
 * SECURITY ACTIONS ---------------------------------------------------------
 */
export const setInitialPasswordThunk = createAsyncThunk(
  "auth/setInitialPassword",
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await authService.setInitialPasswordApi(password);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to set password"));
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordCredentials, { rejectWithValue }) => {
    try {
      return await authService.changePasswordApi(data);
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error, "Failed to change password")
      );
    }
  }
);
