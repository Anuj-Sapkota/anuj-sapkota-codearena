"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Challenge } from "@/types/challenge.types";
import {
  fetchChallengesThunk,
  createChallengeThunk,
  updateChallengeThunk,
  deleteChallengeThunk,
  fetchChallengeBySlugThunk,
  fetchPublicChallengesThunk,
} from "./challenge.actions";

interface ChallengeState {
  items: Challenge[];
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    pages: number;
  };
}

const initialState: ChallengeState = {
  items: [],
  currentChallenge: null,
  isLoading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    clearChallengeError: (state) => {
      state.error = null;
    },
    resetCurrentChallenge: (state) => {
      state.currentChallenge = null;
    },
    // Useful for local updates if you want to increment stats without a full re-fetch
    updateLocalProgress: (
      state,
      action: PayloadAction<{ problemId: number }>,
    ) => {
      if (state.currentChallenge) {
        const problem = state.currentChallenge.problems?.find(
          (p) => p.problemId === action.payload.problemId,
        );
        if (problem && !problem.isSolved) {
          problem.isSolved = true;
          // Recalculate stats locally for instant feedback
          const solvedCount =
            state.currentChallenge.problems?.filter((p) => p.isSolved).length ||
            0;
          const totalCount = state.currentChallenge.problems?.length || 0;
          state.currentChallenge.stats = {
            solvedCount,
            totalCount,
            percentage: totalCount > 0 ? (solvedCount / totalCount) * 100 : 0,
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * FETCH ALL CHALLENGES (Exploration Page)
       */
      .addCase(fetchChallengesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchChallengesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPublicChallengesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicChallengesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data; 
      })
      .addCase(fetchPublicChallengesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      /**
       * CREATE CHALLENGE (Admin)
       */
      .addCase(createChallengeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChallengeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload.data);
        state.meta.total += 1;
      })
      .addCase(createChallengeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /**
       * UPDATE CHALLENGE
       */
      .addCase(updateChallengeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateChallengeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (item) => item.challengeId === action.payload.data.challengeId,
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        // Update current view if the updated challenge is the one being viewed
        if (
          state.currentChallenge?.challengeId ===
          action.payload.data.challengeId
        ) {
          state.currentChallenge = action.payload.data;
        }
      })
      .addCase(updateChallengeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /**
       * DELETE CHALLENGE
       */
      .addCase(deleteChallengeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteChallengeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(
          (item) => item.challengeId !== action.payload.id,
        );
        state.meta.total -= 1;
      })
      .addCase(deleteChallengeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /**
       * FETCH BY SLUG (The Detail View with Progress Stats)
       */
      .addCase(fetchChallengeBySlugThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengeBySlugThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // This is the critical part: action.payload.data now contains { ..., stats, problems: [...isSolved] }
        state.currentChallenge = action.payload.data;
      })
      .addCase(fetchChallengeBySlugThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearChallengeError,
  resetCurrentChallenge,
  updateLocalProgress,
} = challengeSlice.actions;

export default challengeSlice.reducer;
