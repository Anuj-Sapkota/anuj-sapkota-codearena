import {
  ChangePasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
} from "@/app/types/auth";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { isAxiosError } from "axios";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      return await authService.signup(data);
    } catch (error: unknown) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Unknown Error");
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log("This us login data", await authService.login(data));
      return await authService.login(data);
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Unknown Error");
    }
  }
);

export const updateThunk = createAsyncThunk(
  "auth/updateUser",
  async (
    { userId, data }: { userId: number; data: FormData },
    { rejectWithValue }
  ) => {
    try {
      return await userService.updateProfile(userId, data);
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Unknown Error");
    }
  }
);

export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      console.log(await authService.getMe());
      return await authService.getMe();
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Session expired");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // This MUST hit your logoutUser controller on the backend
      // Ensure your axios instance has { withCredentials: true }
      const response = await authService.logout();
      return response;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Logout failed");
    }
  }
);

// app/lib/store/features/authActions.ts

export const setInitialPasswordThunk = createAsyncThunk(
  "auth/setInitialPassword",
  async (password: string, { rejectWithValue }) => {
    try {
      // Assuming you added this to your authService
      const response = await authService.setInitialPasswordApi(password);
      return response.data; // Should return { success: true }
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      console.log(err);
      return rejectWithValue("Failed to set password");
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.changePasswordApi(data);
      return response;
    } catch (err) {
      if (isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.error || "Failed to change password"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);
