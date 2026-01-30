// src/lib/store/features/github/github.actions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api"; // Adjust to your axios instance path
import { handleAxiosError } from "@/utils/axios-error.util";

export const fetchGithubReposThunk = createAsyncThunk(
  "github/fetchRepos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/github/repos");
      return response.data.repos; // This matches your controller's { repos: [...] }
    } catch (err: unknown) {
      return rejectWithValue(handleAxiosError(err, "Failed to fetch repos"));
    }
  },
);
