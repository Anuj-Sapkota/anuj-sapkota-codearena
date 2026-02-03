export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  pushed_at: string;
  updated_at: string;
}

export interface GithubContent {
  name: string;
  path: string;
  type: "dir" | "file";
  sha: string;
}