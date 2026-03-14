import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  applyCreatorThunk,
  verifyCreatorOTPThunk,
  fetchPendingApplicationsThunk,
  reviewApplicationThunk,
} from "./creator.actions";

interface CreatorState {
  step: "FORM" | "OTP" | "PENDING_ADMIN";
  isSubmitting: boolean;
  error: string | null;
  pendingApplications: any[];
  userApplicationStatus: any | null;
}

const initialState: CreatorState = {
  step: "FORM",
  isSubmitting: false,
  error: null,
  pendingApplications: [],
  userApplicationStatus: null,
};

const creatorSlice = createSlice({
  name: "creator",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CreatorState["step"]>) => {
      state.step = action.payload;
    },
    resetCreatorState: (state) => {
      state.step = "FORM";
      state.error = null;
      state.isSubmitting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- 1. APPLY --- */
      .addCase(applyCreatorThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(applyCreatorThunk.fulfilled, (state) => {
        state.isSubmitting = false;
        state.step = "OTP";
      })
      .addCase(applyCreatorThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      /* --- 2. VERIFY OTP --- */
      .addCase(verifyCreatorOTPThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(verifyCreatorOTPThunk.fulfilled, (state) => {
        state.isSubmitting = false;
        state.step = "PENDING_ADMIN";
      })
      .addCase(verifyCreatorOTPThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      /* --- 3. FETCH FOR ADMIN --- */
      .addCase(fetchPendingApplicationsThunk.fulfilled, (state, action) => {
        // Correctly accessing .data from your controller's response
        state.pendingApplications = action.payload.data || [];
      })

      /* --- 4. ADMIN REVIEW --- */
      .addCase(reviewApplicationThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(reviewApplicationThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // 🚀 THE FIX: Filter out the reviewed user from the list
        // Using == or Number() ensures type-safety if one is a string
        state.pendingApplications = state.pendingApplications.filter(
          (app) => Number(app.userId) !== Number(action.payload.userId)
        );
      })
      .addCase(reviewApplicationThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setStep, resetCreatorState } = creatorSlice.actions;
export default creatorSlice.reducer;