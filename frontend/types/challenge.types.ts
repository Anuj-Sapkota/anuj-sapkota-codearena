import { Problem } from "./problem.types";

export interface ChallengeProblem {
  challengeId: number;
  problemId: number;
  order: number;
  problem: Problem;
}

export interface Challenge {
  challengeId: number;
  title: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  isPublic: boolean;
  startTime?: string | Date;
  endTime?: string | Date;
  problems?: ChallengeProblem[];
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
  startTime?: string; // Sent as ISO string from datetime-local input
  endTime?: string; // Sent as ISO string from datetime-local input
  problemIds: number[]; // Array of IDs to be linked in the join table
}
