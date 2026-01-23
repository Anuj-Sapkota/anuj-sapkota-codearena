"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createProblemThunk,
  fetchProblemsThunk,
  updateProblemThunk,
  deleteProblemThunk,
  fetchProblemByIdThunk,
} from "./problem.actions";
import { ProblemsState } from "@/types/problem.types";

const initialState: ProblemsState = {
  problems: [],
  // New: Initialize meta for server-side pagination
  meta: {
    total: 0,
    page: 1,
    pages: 1,
  },
  currentProblem: null,
  isLoading: false,
  error: null,
};

const problemsSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    clearCurrentProblem: (state) => {
      state.currentProblem = null;
    },
    setCurrentProblemBySlug: (state, action: PayloadAction<string>) => {
      state.currentProblem =
        state.problems.find((p) => p.slug === action.payload) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Problems (Server-Side Paginated)
      .addCase(fetchProblemsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProblemsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Data is now expected at action.payload.data
        state.problems = action.payload.data;
        // Meta is now expected at action.payload.meta
        state.meta = action.payload.meta;
      })
      .addCase(fetchProblemsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "An unknown error occurred";
      })

      // Create
      .addCase(createProblemThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProblemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.problems.unshift(action.payload.data);
        // Optional: Increment total count manually if not refetching
        state.meta.total += 1;
      })
      .addCase(createProblemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create problem";
      })

      // Update
      .addCase(updateProblemThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProblemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.problems.findIndex(
          (p) => p.problemId === action.payload.data.problemId,
        );
        if (index !== -1) {
          state.problems[index] = action.payload.data;
        }
        if (state.currentProblem?.problemId === action.payload.data.problemId) {
          state.currentProblem = action.payload.data;
        }
      })
      .addCase(updateProblemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to update problem";
      })

      // Delete
      .addCase(deleteProblemThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProblemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.problems = state.problems.filter(
          (p) => p.problemId !== action.payload.id,
        );
        if (state.currentProblem?.problemId === action.payload.id) {
          state.currentProblem = null;
        }
        // Optional: Decrement total count
        state.meta.total -= 1;
      })
      .addCase(deleteProblemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to delete problem";
      })
      .addCase(fetchProblemByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // We clear currentProblem so the user doesn't see the previous
        // problem's data while the new one is loading
        state.currentProblem = null;
      })
      .addCase(fetchProblemByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload.data is the problem object from your Backend
        state.currentProblem = action.payload.data;
      })
      .addCase(fetchProblemByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        // action.payload is the error message from your rejectWithValue
        state.error = action.payload ?? "Failed to load problem";
      });
  },
});

export const { clearCurrentProblem, setCurrentProblemBySlug } =
  problemsSlice.actions;
export default problemsSlice.reducer;
