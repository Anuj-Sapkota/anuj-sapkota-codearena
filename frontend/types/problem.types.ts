import { Dispatch, SetStateAction } from "react";
import { Category } from "./category.types";

// 1. Define the valid types for our wrapper logic
export type InputDataType = "INT" | "ARRAY" | "STRING" | "BOOLEAN";

export interface TestCase {
  testCaseId: number; 
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
  inputType: InputDataType; // Added to interface
  points: number;
  timeLimit: number;
  functionName: string;
  starterCode: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  memoryLimit: number;
  categories: Category[];
  testCases: TestCase[]; 
  status: "SOLVED" | "ATTEMPTED" | "UNSOLVED";
  isSolved?: boolean;
  _count?: {
    submissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProblemsState {
  problems: Problem[];
  meta: {
    total: number;
    page: number;
    pages: number;
  };
  currentProblem: Problem | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateProblemDTO {
  title: string;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  inputType: InputDataType; // Added to DTO
  timeLimit: number;
  functionName: string;
  points: number;
  starterCode: Record<string, string>;
  memoryLimit: number;
  categoryIds: number[];
  testCases: Omit<TestCase, "testCaseId">[];
}

// UI specific types
export type DifficultyFilter = "all" | "EASY" | "MEDIUM" | "HARD";
export type SortOption = "newest" | "title_asc" | "difficulty_high";

export interface TabProps {
  formData: CreateProblemDTO;
  setFormData: Dispatch<SetStateAction<CreateProblemDTO>>;
  categories?: Category[];
}