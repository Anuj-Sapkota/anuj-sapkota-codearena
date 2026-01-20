import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  fetchCategoriesThunk, 
  createCategoryThunk, 
  updateCategoryThunk, 
  deleteCategoryThunk 
} from "./category.actions";
import type { Category, CategoryState } from "@/types/category.types";

const initialState: CategoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const categorySlice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* --- FETCH ALL --- */
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action: PayloadAction<{ data: Category[] }>) => {
        state.isLoading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- CREATE --- */
      .addCase(createCategoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategoryThunk.fulfilled, (state, action: PayloadAction<{ data: Category }>) => {
        state.isLoading = false;
        state.items.unshift(action.payload.data); // Use unshift to show new item at top
      })
      .addCase(createCategoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- UPDATE --- */
      .addCase(updateCategoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action: PayloadAction<{ data: Category }>) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.categoryId === action.payload.data.categoryId);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* --- DELETE --- */
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.categoryId !== action.payload);
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;