// store/discussion.slice.ts
"use client";

import { createSlice } from "@reduxjs/toolkit";
import { Discussion } from "@/types/discussion.types";
import {
  fetchDiscussionsThunk,
  createDiscussionThunk,
  toggleUpvoteThunk,
} from "./discussion.actions";

interface DiscussionState {
  items: Discussion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscussionState = {
  items: [],
  isLoading: false,
  error: null,
};

const discussionSlice = createSlice({
  name: "discussion",
  initialState,
  reducers: {
    clearDiscussionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH DISCUSSIONS
      .addCase(fetchDiscussionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscussionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchDiscussionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // CREATE DISCUSSION (Thread or Reply)
      .addCase(createDiscussionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const newPost = action.payload.data;
        
        if (newPost.parentId) {
          // If it's a reply, find parent and push to replies array
          const parent = state.items.find((item) => item.id === newPost.parentId);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(newPost);
          }
        } else {
          // New top-level thread
          state.items.unshift(newPost);
        }
      })

      // TOGGLE UPVOTE (Optimistic update or direct replacement)
      .addCase(toggleUpvoteThunk.fulfilled, (state, action) => {
        const updatedDoc = action.payload.data;
        const index = state.items.findIndex((item) => item.id === updatedDoc.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updatedDoc };
        }
      });
  },
});

export const { clearDiscussionError } = discussionSlice.actions;
export default discussionSlice.reducer;