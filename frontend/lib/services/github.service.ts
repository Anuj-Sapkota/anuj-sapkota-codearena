import api from "@/lib/api";
import { GithubContent, GithubRepo } from "@/types/github.types";

export const githubService = {
  fetchRepos: async (): Promise<GithubRepo[]> => {
    const { data } = await api.get("/github/repos");
    // Backend returns { success: true, repos: [...] }
    return data.repos ?? data;
  },

  fetchRepoContents: async (
    owner: string,
    repo: string,
    path: string,
  ): Promise<GithubContent[]> => {
    // Backend route: GET /github/repos/:owner/:repo/contents?path=...
    const { data } = await api.get(`/github/repos/${owner}/${repo}/contents`, {
      params: { path },
    });
    return data;
  },

  createFolder: async (
    owner: string,
    repo: string,
    path: string,
    folderName: string,
  ): Promise<void> => {
    // Backend route: POST /github/repos/create-folder
    await api.post("/github/repos/create-folder", { owner, repo, path, folderName });
  },

  pushCode: async (
    repoFullName: string,
    code: string,
    path: string,
    commitMessage: string,
  ): Promise<{ url: string }> => {
    const { data } = await api.post("/github/push", {
      repoFullName,
      code,
      path,
      commitMessage,
    });
    return data;
  },
};
