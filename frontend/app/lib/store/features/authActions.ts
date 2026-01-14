import { LoginCredentials, RegisterCredentials } from "@/app/types/auth";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { BasicSettingsFormValue } from "@/app/types/settings";
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
      return await authService.getMe();
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue("Session expired");
    }
  }
);
