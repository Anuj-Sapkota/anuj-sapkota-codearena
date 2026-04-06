import { createAsyncThunk } from "@reduxjs/toolkit";

import { authService } from "@/lib/services/auth.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { tokenStore } from "@/lib/token";
import axios from "axios";
import config from "@/config";
import { API } from "@/constants/api.constants";

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
      const result = await authService.signup(data);
      if (result.accessToken) tokenStore.set(result.accessToken);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Registration failed"));
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(data);
      if (result.accessToken) tokenStore.set(result.accessToken);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Login failed"));
    }
  },
);

/**
 * Called on app boot — uses the httpOnly refreshToken cookie to get a new access token.
 * This replaces getMeThunk as the primary session hydration mechanism.
 */
export const refreshSessionThunk = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${config.apiUrl}${API.AUTH.REFRESH}`,
        {},
        { withCredentials: true },
      );
      if (data.accessToken) tokenStore.set(data.accessToken);
      return data; // { accessToken, user }
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Session expired"));
    }
  },
);

/**
 * USER MANAGEMENT -----------------------------------------------------------
 */
export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Session expired"));
    }
  },
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Logout failed"));
    }
  },
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
  },
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordCredentials, { rejectWithValue }) => {
    try {
      return await authService.changePasswordApi(data);
    } catch (error: unknown) {
      return rejectWithValue(
        handleAxiosError(error, "Failed to change password"),
      );
    }
  },
);
