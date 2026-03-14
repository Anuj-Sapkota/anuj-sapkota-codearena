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
  // Admin & Status Data
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
    // 🚀 FIXED: Correctly accessing action.payload
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
      /* --- 1. APPLY (Initial Submission) --- */
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
        // action.payload.data if your backend wraps it in a data property
        state.pendingApplications = action.payload.data || action.payload;
      })

      /* --- 4. ADMIN REVIEW --- */
      .addCase(reviewApplicationThunk.fulfilled, (state, action) => {
        state.pendingApplications = state.pendingApplications.filter(
          (app) => app.userId !== action.payload.userId,
        );
      });
  },
});

export const { setStep, resetCreatorState } = creatorSlice.actions;
export default creatorSlice.reducer;
