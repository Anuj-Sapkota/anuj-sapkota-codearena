import { categoryService } from "@/lib/services/category.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/category.types";

/**
 * CATEGORY MANAGEMENT --------------------------------------------------
 */
export const createCategoryThunk = createAsyncThunk(
  "category/create",
  async (data: CreateCategoryDTO, { rejectWithValue }) => {
    try {
      return await categoryService.create(data);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to create category"));
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAll();
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch categories"));
    }
  }
);

/**
 * UPDATE CATEGORY --------------------------------------------------
 */
export const updateCategoryThunk = createAsyncThunk(
  "category/update",
  async ({ id, data }: { id: number; data: UpdateCategoryDTO }, { rejectWithValue }) => {
    try {
      return await categoryService.update(id, data);
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to update category"));
    }
  }
);

/**
 * DELETE CATEGORY --------------------------------------------------
 */
export const deleteCategoryThunk = createAsyncThunk(
  "category/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id; 
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to delete category"));
    }
  }
);