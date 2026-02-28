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
export const getByProblem = async (
  problemId: number, 
  currentUserId?: number, 
  sortBy: "newest" | "most_upvoted" = "newest" // Default to newest
) => {

  console.log("From the service: ", sortBy)
  // Define the sort object for Prisma
  const orderBy: any = sortBy === "most_upvoted" 
    ? { upvotes: "desc" } 
    : { createdAt: "desc" };

  const discussions = await prisma.discussion.findMany({
    where: { problemId, parentId: null },
    include: {
      user: { select: { username: true, profile_pic_url: true } },
      upvoteTracks: currentUserId ? { where: { userId: currentUserId } } : false,
      replies: {
        include: {
          user: { select: { username: true } },
          upvoteTracks: currentUserId ? { where: { userId: currentUserId } } : false,
        },
        orderBy: { createdAt: "asc" }, // Replies usually stay chronological
      },
    },
    orderBy: orderBy, // Apply dynamic sorting here
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
