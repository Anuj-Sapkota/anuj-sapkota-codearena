import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getMeThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  refreshSessionThunk,
  setInitialPasswordThunk,
} from "@/lib/store/features/auth/auth.actions";

import { verifyCreatorOTPThunk } from "@/lib/store/features/creator/creator.actions";

import type { AuthState, UserProfile } from "@/types/auth.types";

/**
 * INITIAL REDUX STATE
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
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
    // To manually clear the social id
    updateSocialLinks: (
      state,
      action: {
        payload: { provider: "google" | "github"; value: string | null };
      },
    ) => {
      if (state.user) {
        if (action.payload.provider === "google") {
          state.user.google_id = action.payload.value;
        } else {
          state.user.github_id = action.payload.value;
        }
      }
    },
    // Patch specific fields on the user — used by React Query mutations
    patchUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
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

      /* --- GET ME --- */
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })

      /* --- REFRESH SESSION (app boot) --- */
      .addCase(refreshSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isHydrated = true;
        state.user = action.payload.user;
      })
      .addCase(refreshSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.isHydrated = true;
        state.user = null;
        state.isAuthenticated = false;
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

      /* --- SET INITIAL PASSWORD --- */
      .addCase(setInitialPasswordThunk.fulfilled, (state) => {
        if (state.user) {
          state.user.has_password = true;
        }
      })

      /* --- 🚀 CREATOR VERIFICATION SYNC --- */
      // This is the "Magic Fix". When OTP is verified successfully, 
      // we update the user object in the Auth slice so Redux Persist saves it.
      .addCase(verifyCreatorOTPThunk.fulfilled, (state, action) => {
        // action.payload.data should contain the updated user from your backend
        const updatedUser = action.payload.data;
        
        if (state.user && updatedUser) {
          state.user = {
            ...state.user,
            creatorStatus: updatedUser.creatorStatus || "PENDING",
            // Also sync the profile if your backend returns it
            creatorProfile: updatedUser.creatorProfile || state.user.creatorProfile
          };
        }
      });
  },
});

export const { clearError, setLogout, updateSocialLinks, patchUser } = authSlice.actions;
export default authSlice.reducer;