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

//pushing to github services
export const pushFile = async (
  token: string,
  repoFullName: string,
  path: string,
  code: string,
  message: string,
) => {
  let sha: string | undefined;

  // 1. Check if file exists to get the SHA (required for updates)
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${repoFullName}/contents/${path}`,
      { headers: { Authorization: `token ${token}` } },
    );
    sha = data.sha;
  } catch (error: any) {
    // 404 is fine, it just means the file is new
    if (error.response?.status !== 404) throw error;
  }

  // 2. Perform the PUT request
  const response = await axios.put(
    `https://api.github.com/repos/${repoFullName}/contents/${path}`,
    {
      message,
      content: Buffer.from(code).toString("base64"),
      sha,
    },
    { headers: { Authorization: `token ${token}` } },
  );

  return response.data;
};

export const getContents = async (
  token: string,
  repoFullName: string,
  path: string,
) => {
  const response = await axios.get(
    `https://api.github.com/repos/${repoFullName}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  return response.data;
};

export const createFolder = async (
  token: string,
  repoFullName: string,
  path: string,
  folderName: string,
) => {
  // Sanitize path: remove leading/trailing slashes
  const cleanPath = path.replace(/^\/|\/$/g, "");
  const folderPath = cleanPath ? `${cleanPath}/${folderName}` : folderName;
  const finalPath = `${folderPath}/.gitkeep`;

  const response = await axios.put(
    `https://api.github.com/repos/${repoFullName}/contents/${finalPath}`,
    {
      message: `infra: create directory ${folderName}`,
      content: Buffer.from("").toString("base64"), // GitHub needs base64 content
    },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  return response.data;
};
