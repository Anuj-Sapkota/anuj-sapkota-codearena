import type { ReportType } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

/**
 * Helper to recursively inject hasUpvoted into discussion trees
 */
const formatDiscussion = (disc: any): any => {
  return {
    ...disc,
    // If the array exists and has at least one entry, the user has upvoted
    hasUpvoted: disc.upvoteTracks ? disc.upvoteTracks.length > 0 : false,
    // Recursively format replies
    replies: disc.replies ? disc.replies.map(formatDiscussion) : [],
  };
};

/**
 * Fetch all top-level discussions for a problem
 */
// services/discussion.service.ts

export const getByProblem = async (
  problemId: number,
  currentUserId?: number,
  sortBy: "newest" | "most_upvoted" = "newest",
  language?: string,
  search?: string,
  userRole?: string, // Add userRole here
) => {
  const orderBy: any =
    sortBy === "most_upvoted" ? { upvotes: "desc" } : { createdAt: "desc" };

  const discussions = await prisma.discussion.findMany({
    where: {
      problemId,
      parentId: null,
      ...(language && language !== "all" ? { language } : {}),
      ...(search ? { content: { contains: search, mode: "insensitive" } } : {}),

      // NEW LOGIC: Only filter out blocked posts if the user is NOT an admin
      ...(userRole !== "ADMIN" ? { isBlocked: false } : {}),
    },
    include: {
      user: { select: { username: true, profile_pic_url: true, role: true } },
      upvoteTracks: currentUserId
        ? { where: { userId: currentUserId } }
        : false,
      replies: {
        include: {
          user: { select: { username: true, role: true } },
          upvoteTracks: currentUserId
            ? { where: { userId: currentUserId } }
            : false,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: orderBy,
  });

  return discussions.map(formatDiscussion);
};
/**
 * Toggle Upvote logic
 */
export const toggleUpvoteService = async (
  discussionId: string,
  userId: number,
) => {
  const existing = await prisma.discussionUpvote.findUnique({
    where: {
      userId_discussionId: { userId, discussionId },
    },
  });

  let updatedDiscussion;

  if (existing) {
    updatedDiscussion = await prisma.$transaction(async (tx) => {
      await tx.discussionUpvote.delete({ where: { id: existing.id } });
      return await tx.discussion.update({
        where: { id: discussionId },
        data: { upvotes: { decrement: 1 } },
        include: { upvoteTracks: { where: { userId } } },
      });
    });
  } else {
    updatedDiscussion = await prisma.$transaction(async (tx) => {
      await tx.discussionUpvote.create({ data: { userId, discussionId } });
      return await tx.discussion.update({
        where: { id: discussionId },
        data: { upvotes: { increment: 1 } },
        include: { upvoteTracks: { where: { userId } } },
      });
    });
  }

  // Return formatted version so Redux gets the updated 'hasUpvoted' boolean
  return formatDiscussion(updatedDiscussion);
};

/**
 * Create a new post or reply
 */
export const createDiscussionService = async (data: {
  content: string;
  userId: number;
  problemId: number;
  parentId?: string | null;
  language?: string | null;
}) => {
  // Logic to handle language fallback
  const match = data.content.match(/```(\w+)/);
  const languageFallback = match ? match[1] : null;
  const finalLanguage = data.language || languageFallback;

  const newPost = await prisma.discussion.create({
    data: {
      content: data.content,
      userId: data.userId,
      problemId: data.problemId,
      language: finalLanguage,
      parentId: data.parentId ?? null,
    } as any,
    include: {
      user: {
        select: { username: true, full_name: true, profile_pic_url: true },
      },
      upvoteTracks: { where: { userId: data.userId } },
    },
  });

  return formatDiscussion(newPost);
};

/**
 * Update an existing post
 */
export const updateDiscussionService = async (
  discussionId: string,
  userId: number,
  data: { content?: string; language?: string | null },
) => {
  const updated = await prisma.discussion.update({
    where: { id: discussionId, userId },
    data: {
      ...data,
      language:
        data.language !== undefined
          ? data.language
          : (data.content?.match(/```(\w+)/)?.[1] ?? null),
    },
    include: {
      user: {
        select: { username: true, full_name: true, profile_pic_url: true },
      },
      upvoteTracks: { where: { userId } },
    },
  });

  return formatDiscussion(updated);
};

/**
 * Delete a post
 */
export const deleteDiscussionService = async (
  discussionId: string,
  userId: number,
) => {
  return await prisma.discussion.delete({
    where: { id: discussionId, userId },
  });
};

/**
 * Report a discussion. Auto-blocks if reports reach 5.
 */

export const reportDiscussionService = async (
  discussionId: string,
  userId: number,
  reportType: ReportType, // Strictly typed to your Prisma Enum
  details?: string,
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the report record
    const created = await tx.discussionReport.create({
      data: {
        userId,
        discussionId,
        reportType, // Matches Enum in schema
        details, 
      },
    });

    console.log("Created discussion report entry ID: ", created.id);

    // 2. Increment the count on the discussion
    const updated = await tx.discussion.update({
      where: { id: discussionId },
      data: { reportCount: { increment: 1 } },
    });

    // 3. Auto-moderation logic: Block if threshold reached
    const REPORT_THRESHOLD = 5;
    if (updated.reportCount >= REPORT_THRESHOLD && !updated.isBlocked) {
      await tx.discussion.update({
        where: { id: discussionId },
        data: { isBlocked: true },
      });
      console.log(
        `AUTO_MODERATION: Discussion ${discussionId} blocked at ${updated.reportCount} reports.`,
      );
    }

    return updated;
  });
};

/**
 * Admin: Get all flagged discussions
 */
export const getFlaggedDiscussions = async () => {
  return await prisma.discussion.findMany({
    where: { reportCount: { gt: 0 } },
    include: {
      user: { select: { username: true } },
      reports: { include: { user: { select: { username: true } } } },
    },
    orderBy: { reportCount: "desc" },
  });
};

/**
 * Admin: Moderation Action
 */
export const moderateDiscussionService = async (
  id: string,
  action: "BLOCK" | "UNBLOCK",
) => {
  return await prisma.discussion.update({
    where: { id },
    data: {
      isBlocked: action === "BLOCK",
      // Optional: Reset count if unblocked
      reportCount: action === "UNBLOCK" ? 0 : undefined,
    },
  });
};
