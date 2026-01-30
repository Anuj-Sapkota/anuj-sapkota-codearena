import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

export const getUserRepos = async (userId: number) => {
  // 1. Get the token from our DB
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { github_access_token: true },
  });

  if (!user?.github_access_token) {
    throw new ServiceError("GitHub account not linked or token missing", 401);
  }

  // 2. Fetch repos from GitHub API
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${user.github_access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "updated",
        per_page: 100,
      },
    });

    return response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
    }));
  } catch (error) {
    throw new ServiceError("Failed to fetch GitHub repositories", 500);
  }
};
