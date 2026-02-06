import { createSlice } from "@reduxjs/toolkit";
import { Challenge } from "@/types/challenge.types";
import {
  fetchChallengesThunk,
  createChallengeThunk,
  updateChallengeThunk,
  deleteChallengeThunk,
  fetchChallengeBySlugThunk,
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
  },
  extraReducers: (builder) => {
    builder
      /**
       * FETCH ALL CHALLENGES
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

      /**
       * CREATE CHALLENGE
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
          (item) => item.challengeId === action.payload.data.challengeId
        );
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (state.currentChallenge?.challengeId === action.payload.data.challengeId) {
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
        state.items = state.items.filter((item) => item.challengeId !== action.payload.id);
        state.meta.total -= 1;
      })
      .addCase(deleteChallengeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /**
       * FETCH BY SLUG
       */
      .addCase(fetchChallengeBySlugThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengeBySlugThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChallenge = action.payload.data;
      })
      .addCase(fetchChallengeBySlugThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChallengeError, resetCurrentChallenge } = challengeSlice.actions;
export default challengeSlice.reducer;