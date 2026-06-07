import { Problem } from "./problem.types";

export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";

// 1. Updated ChallengeProblem to include optional solve status
export interface ChallengeProblem {
  challengeId: number;
  problemId: number;
  order: number;
  problem: Problem;
  isSolved?: boolean; // Added for UI tracking
}

// 2. Updated Challenge with stats and localized problems
export interface Challenge {
  challengeId: number;
  title: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  isPublic: boolean;
  difficulty: ChallengeDifficulty;
  points: number;
  startTime?: string | Date;
  endTime?: string | Date;
  problems?: (ChallengeProblem & { isSolved?: boolean })[];
  
  stats?: {
    solvedCount: number;
    totalCount: number;
    percentage: number;
  };

  _count?: {
    problems: number;
  };
}

/**
 * Data Transfer Object for creating/updating challenges
 */
export interface CreateChallengeDTO {
  title: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  isPublic: boolean;
  difficulty: ChallengeDifficulty;
  points: number;
  startTime?: string; 
  endTime?: string; 
  problemIds: number[]; 
}