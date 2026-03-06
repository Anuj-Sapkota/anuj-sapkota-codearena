import { createSlice } from "@reduxjs/toolkit";
import {
  applyCreatorThunk,
  verifyCreatorOTPThunk,
  reviewApplicationThunk,
} from "./creator.actions";

interface CreatorState {
  isSubmitting: boolean;
  isVerifying: boolean;
  step: "FORM" | "OTP" | "PENDING_ADMIN";
  error: string | null;
}

const initialState: CreatorState = {
  isSubmitting: false,
  isVerifying: false,
  step: "FORM",
  error: null,
};

const creatorSlice = createSlice({
  name: "creator",
  initialState,
  reducers: {
    resetCreatorState: (state) => {
      state.step = "FORM";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // APPLY
      .addCase(applyCreatorThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(applyCreatorThunk.fulfilled, (state) => {
        state.isSubmitting = false;
        state.step = "OTP"; // Move to OTP verification step
      })
      .addCase(applyCreatorThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // VERIFY OTP
      .addCase(verifyCreatorOTPThunk.pending, (state) => {
        state.isVerifying = true;
      })
      .addCase(verifyCreatorOTPThunk.fulfilled, (state) => {
        state.isVerifying = false;
        state.step = "PENDING_ADMIN"; // Finally waiting for admin
      })
      .addCase(verifyCreatorOTPThunk.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCreatorState } = creatorSlice.actions;
export default creatorSlice.reducer;
