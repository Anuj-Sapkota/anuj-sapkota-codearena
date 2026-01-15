import { AuthState } from "@/app/types/auth";
import { createSlice } from "@reduxjs/toolkit";
import {
  getMeThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  setInitialPasswordThunk,
  updateThunk,
} from "./authActions";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    //to manually clear the social id
    updateSocialLinks: (
      state,
      action: {
        payload: { provider: "google" | "github"; value: string | null };
      }
    ) => {
      if (state.user) {
        if (action.payload.provider === "google") {
          state.user.google_id = action.payload.value;
        } else {
          state.user.github_id = action.payload.value;
        }
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
        state.user = action.payload.user;
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
        state.isLoading = false;
        if (state.user) {
          const { data } = action.payload;
          state.user = { ...state.user, ...data };
        }
      })
      .addCase(updateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- GET ME --- */
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })

      /* --- LOGOUT --- */
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(setInitialPasswordThunk.fulfilled, (state) => {
        if (state.user) {
          state.user.has_password = true; 
        }
      });
  },
});

export const { clearError, setLogout, updateSocialLinks } = authSlice.actions;
export default authSlice.reducer;
