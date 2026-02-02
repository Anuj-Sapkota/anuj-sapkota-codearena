import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { handleAxiosError } from "@/utils/axios-error.util";

/**
 * Fetches contents of a specific repository path
 * @param payload { owner, repo, path }
 */
export const fetchRepoContentsThunk = createAsyncThunk(
  "github/fetchContents",
  async (
    payload: { owner: string; repo: string; path: string },
    { rejectWithValue },
  ) => {
    try {
      const { owner, repo, path } = payload;
      const response = await api.get(
        `/github/repos/${owner}/${repo}/contents`,
        {
          params: { path },
        },
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, "Failed to load directory"));
    }
  },
);

/**
 * Creates a new folder (via .gitkeep) in the specified path
 */
export const createGithubFolderThunk = createAsyncThunk(
  "github/createFolder",
  async (
    payload: { owner: string; repo: string; path: string; folderName: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/github/repos/create-folder", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, "Failed to create folder"));
    }
  },
);

/**
 * The final push of the code file
 */
export const pushToGithubThunk = createAsyncThunk(
  "github/pushCode",
  async (
    payload: {
      repoFullName: string;
      code: string;
      path: string;
      commitMessage: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/github/push", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, "Push failed"));
    }
  },
);

/**
 * Fetches all repositories the authenticated user has access to.
 * Usually filters for 'owner' or 'all' based on your requirements.
 */
export const fetchGithubReposThunk = createAsyncThunk(
  "github/repos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/github/repos");

      // Look inside the response object for the 'repos' key
      const repoList = response.data.repos;

      if (!Array.isArray(repoList)) {
        console.error("Expected repos array but got:", response.data);
        return [];
      }

      return [...repoList].sort((a: any, b: any) => {
        const dateA = new Date(a.pushed_at || 0).getTime();
        const dateB = new Date(b.pushed_at || 0).getTime();
        return dateB - dateA;
      });
    } catch (err: any) {
      return rejectWithValue(
        handleAxiosError(err, "Failed to fetch repositories"),
      );
    }
  },
);
