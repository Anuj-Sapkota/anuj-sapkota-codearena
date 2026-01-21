import { Category } from "./category.types";

export interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface Problem {
  problemId: number;
  title: string;
  slug: string;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimit: number;
  memoryLimit: number;
  categories: Category[];
  testCases?: TestCase[];
  _count?: {
    submissions: number;
  };
  createdAt: string;
  updatedAt: string;
}


export interface ProblemsState {
  problems: Problem[];
  // New meta object to track server-side pagination state
  meta: {
    total: number;
    page: number;
    pages: number;
  };
  currentProblem: Problem | null;
  isLoading: boolean;
  error: string | null;
}

// DTOs for Actions
export interface CreateProblemDTO {
  title: string;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  timeLimit: number;
  memoryLimit: number;
  categoryIds: number[];
  testCases: Omit<TestCase, "id">[];
}

export type DifficultyFilter = "all" | "EASY" | "MEDIUM" | "HARD";
export type SortOption = "newest" | "title_asc" | "difficulty_high";

export interface FilterState {
  sortBy: SortOption;
  difficulty: DifficultyFilter;
}