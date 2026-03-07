// store/discussion.slice.ts
"use client";

import { createSlice } from "@reduxjs/toolkit";
import { Discussion } from "@/types/discussion.types";
import {
  fetchDiscussionsThunk,
  createDiscussionThunk,
  toggleUpvoteThunk,
  updateDiscussionThunk,
  deleteDiscussionThunk,
  moderateDiscussionThunk,
  reportDiscussionThunk,
  // pinDiscussionThunk,
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

/**
 * RECURSIVE HELPERS
 */
const updateItemInTree = (
  items: Discussion[],
  updatedItem: Discussion,
): Discussion[] => {
  return items.map((item) => {
    if (item.id === updatedItem.id) {
      return {
        ...item,
        ...updatedItem,
        replies: updatedItem.replies || item.replies,
      };
    }
    if (item.replies && item.replies.length > 0) {
      return { ...item, replies: updateItemInTree(item.replies, updatedItem) };
    }
    return item;
  });
};

const addItemToTree = (
  items: Discussion[],
  parentId: string,
  newItem: Discussion,
): Discussion[] => {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, replies: [...(item.replies || []), newItem] };
    }
    if (item.replies && item.replies.length > 0) {
      return {
        ...item,
        replies: addItemToTree(item.replies, parentId, newItem),
      };
    }
    return item;
  });
};

const removeItemFromTree = (
  items: Discussion[],
  idToRemove: string,
): Discussion[] => {
  return items
    .filter((item) => item.id !== idToRemove)
    .map((item) => ({
      ...item,
      replies: item.replies ? removeItemFromTree(item.replies, idToRemove) : [],
    }));
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

      // CREATE
      .addCase(createDiscussionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const newPost = action.payload.data;
        if (newPost.parentId) {
          state.items = addItemToTree(state.items, newPost.parentId, newPost);
        } else {
          state.items.unshift(newPost);
        }
      })

      // UPDATE ACTIONS (Upvote, Edit)
      .addCase(toggleUpvoteThunk.fulfilled, (state, action) => {
        state.items = updateItemInTree(state.items, action.payload.data);
      })
      .addCase(updateDiscussionThunk.fulfilled, (state, action) => {
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      // NEW: REPORT ACTION
      // This ensures the UI reflects the new reportCount immediately
      .addCase(reportDiscussionThunk.fulfilled, (state, action) => {
        // action.payload.data is the updated discussion returned from reportDiscussionService
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      // NEW: MODERATE ACTION
      // This ensures the UI reflects Blocked/Unblocked status immediately
      .addCase(moderateDiscussionThunk.fulfilled, (state, action) => {
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      // DELETE
      .addCase(deleteDiscussionThunk.fulfilled, (state, action) => {
        state.items = removeItemFromTree(state.items, action.payload.id);
      });
  },
});

export const { clearDiscussionError } = discussionSlice.actions;
export default discussionSlice.reducer;