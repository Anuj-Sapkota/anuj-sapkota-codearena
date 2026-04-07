import api from "@/lib/api";
import { GithubContent, GithubRepo } from "@/types/github.types";

export const githubService = {
  fetchRepos: async (): Promise<GithubRepo[]> => {
    const { data } = await api.get("/github/repos");
    return data;
  },

  fetchRepoContents: async (
    owner: string,
    repo: string,
    path: string,
  ): Promise<GithubContent[]> => {
    const { data } = await api.get("/github/contents", {
      params: { owner, repo, path },
    });
    return data;
  },

  createFolder: async (
    owner: string,
    repo: string,
    path: string,
    folderName: string,
  ): Promise<void> => {
    await api.post("/github/create-folder", { owner, repo, path, folderName });
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
