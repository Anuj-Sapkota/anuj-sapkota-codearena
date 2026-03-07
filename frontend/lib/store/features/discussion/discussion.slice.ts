"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Discussion } from "@/types/discussion.types";
import {
  fetchDiscussionsThunk,
  fetchFlaggedDiscussionsThunk,
  createDiscussionThunk,
  toggleUpvoteThunk,
  updateDiscussionThunk,
  deleteDiscussionThunk,
  moderateDiscussionThunk,
  reportDiscussionThunk,
} from "./discussion.actions";

interface DiscussionState {
  items: Discussion[];
  flaggedItems: Discussion[]; // Admin-only dashboard data
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscussionState = {
  items: [],
  flaggedItems: [],
  isLoading: false,
  error: null,
};

/**
 * RECURSIVE HELPERS
 * These handle deep updates in the nested discussion/reply tree.
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
        // Ensure we don't accidentally wipe out nested replies if they weren't in the update
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
      /**
       * FETCH ACTIONS
       */
      // Standard User View
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

      // Admin Flagged View
      .addCase(fetchFlaggedDiscussionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFlaggedDiscussionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flaggedItems = action.payload;
      })
      .addCase(fetchFlaggedDiscussionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /**
       * WRITE ACTIONS
       */
      .addCase(createDiscussionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const newPost = action.payload.data;
        if (newPost.parentId) {
          state.items = addItemToTree(state.items, newPost.parentId, newPost);
        } else {
          state.items.unshift(newPost);
        }
      })

      .addCase(toggleUpvoteThunk.fulfilled, (state, action) => {
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      .addCase(updateDiscussionThunk.fulfilled, (state, action) => {
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      /**
       * MODERATION & REPORTING
       */
      .addCase(reportDiscussionThunk.fulfilled, (state, action) => {
        // Update report count/status in main tree
        state.items = updateItemInTree(state.items, action.payload.data);
      })

      .addCase(moderateDiscussionThunk.fulfilled, (state, action) => {
        const { id, action: modAction, data } = action.payload;

        // 1. Always sync the main discussion tree
        state.items = updateItemInTree(state.items, data);

        // 2. Manage the Flagged Dashboard list
        if (modAction === "UNBLOCK") {
          // If approved, remove from moderation queue entirely
          state.flaggedItems = state.flaggedItems.filter(
            (item) => item.id !== id,
          );
        } else {
          // If blocked, update the item's state in the queue
          state.flaggedItems = state.flaggedItems.map((item) =>
            item.id === id ? data : item,
          );
        }
      })

      /**
       * DELETE
       */
      .addCase(deleteDiscussionThunk.fulfilled, (state, action) => {
        const idToRemove = action.payload.id;
        state.items = removeItemFromTree(state.items, idToRemove);
        state.flaggedItems = state.flaggedItems.filter(
          (i) => i.id !== idToRemove,
        );
      });
  },
});

export const { clearDiscussionError } = discussionSlice.actions;
export default discussionSlice.reducer;
