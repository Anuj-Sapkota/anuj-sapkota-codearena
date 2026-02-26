import { prisma } from "../lib/prisma.js";

/**
 * Fetch all top-level discussions for a problem
 */
export const getByProblem = async (problemId: number, currentUserId?: number) => {
  return await prisma.discussion.findMany({
    where: { problemId, parentId: null },
    include: {
      user: { 
        select: { 
          username: true, 
          full_name: true, 
          profile_pic_url: true 
        } 
      },
      replies: {
        include: { 
          user: { 
            select: { username: true, full_name: true } 
          } 
        },
        orderBy: { createdAt: "asc" },
      },
      upvoteTracks: currentUserId ? { where: { userId: currentUserId } } : false,
    },
    orderBy: { createdAt: "desc" },
  });
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
  const match = data.content.match(/```(\w+)/);
  const languageFallback = match ? match[1] : null;
  const finalLanguage = data.language || languageFallback;

  return await prisma.discussion.create({
    data: {
      content: data.content,
      userId: data.userId,
      problemId: data.problemId,
      language: finalLanguage,
      parentId: data.parentId ?? null, 
    } as any, 
    include: { 
      user: { 
        select: { username: true, full_name: true } 
      } 
    },
  });
};

/**
 * Update an existing post (only content/language)
 */
export const updateDiscussionService = async (
  discussionId: string, 
  userId: number, 
  data: { content?: string; language?: string | null }
) => {
  // We include userId in 'where' to ensure users can only edit their own posts
  return await prisma.discussion.update({
    where: { 
      id: discussionId,
      userId: userId 
    },
    data: {
      ...data,
      // If content changed, re-detect language if not explicitly provided
      language: data.language !== undefined ? data.language : (data.content?.match(/```(\w+)/)?.[1] ?? null)
    },
  });
};

/**
 * Delete a post
 * Note: Prisma 'onDelete: Cascade' in your schema should handle replies/upvotes
 */
export const deleteDiscussionService = async (discussionId: string, userId: number) => {
  return await prisma.discussion.delete({
    where: { 
      id: discussionId,
      userId: userId // Authorization check
    },
  });
};

/**
 * Toggle Upvote logic
 */
export const toggleUpvoteService = async (discussionId: string, userId: number) => {
  const existing = await prisma.discussionUpvote.findUnique({
    where: { 
      userId_discussionId: { userId, discussionId } 
    },
  });

  if (existing) {
    return await prisma.$transaction(async (tx) => {
      await tx.discussionUpvote.delete({ where: { id: existing.id } });
      return await tx.discussion.update({
        where: { id: discussionId },
        data: { upvotes: { decrement: 1 } },
      });
    });
  }

  return await prisma.$transaction(async (tx) => {
    await tx.discussionUpvote.create({ data: { userId, discussionId } });
    return await tx.discussion.update({
      where: { id: discussionId },
      data: { upvotes: { increment: 1 } },
    });
  });
};