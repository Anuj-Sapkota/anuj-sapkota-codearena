export interface UserBasicInfo {
  username: string;
  full_name: string;
  profile_pic_url?: string | null;
}

export interface Discussion {
  id: string;
  content: string;
  language: string | null;
  upvotes: number;

  userId: number;
  problemId: number;
  parentId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  reportCount: number;
  isBlocked: boolean;
  // Relations
  user: UserBasicInfo;
  replies?: Discussion[];

  // UI Helpers (Calculated by Backend Service/Controller)
  hasUpvoted?: boolean;
  _count?: {
    replies: number;
    upvoteTracks: number;
  };
}

/**
 * Data Transfer Object for creating a new post
 */
export interface CreateDiscussionDTO {
  content: string;
  problemId: number;
  language?: string | null;
  parentId?: string | null;
}

/**
 * Interface for the API Response structure
 * matching your Challenge service pattern
 */
export interface DiscussionResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
