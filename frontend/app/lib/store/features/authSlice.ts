import { AuthState, UserProfile } from "@/app/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getMeThunk,
  loginThunk,
  registerThunk,
  updateThunk,
} from "./authActions";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    // Clear error messages manually
    clearError: (state) => {
      state.error = null;
    },
    // Standard logout to wipe state
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    // manual user state update
    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- LOGIN --- */
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("This is payload of user:", action.payload.user);
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- REGISTER --- */
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- UPDATE USER --- */
      .addCase(updateThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateThunk.fulfilled, (state, action) => {
        console.log("This is action payload", action.payload);

        state.isLoading = false;
        if (state.user) {
          const { data } = action.payload;
          // Merges updated data from API into existing user state
          state.user = { ...state.user, ...data };
        }
      })
      .addCase(updateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      });
  },
});

export const { clearError, setLogout, updateUser } = authSlice.actions;
export default authSlice.reducer;
