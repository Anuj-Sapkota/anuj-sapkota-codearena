import type { ReportType } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";
import { createNotification } from "./notification.service.js";
import { truncate } from "../utils/truncate.util.js";

/**
 * Helper to recursively inject hasUpvoted into discussion trees
 */
const formatDiscussion = (disc: any): any => {
  return {
    ...disc,
    hasUpvoted: disc.upvoteTracks ? disc.upvoteTracks.length > 0 : false,
    hasReported: disc.reports ? disc.reports.length > 0 : false,
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
  userRole?: string,
) => {
  const orderBy: any =
    sortBy === "most_upvoted" ? { upvotes: "desc" } : { createdAt: "desc" };

  const discussions = await prisma.discussion.findMany({
    where: {
      problemId,
      parentId: null,
      ...(language && language !== "all" ? { language } : {}),
      ...(search ? { content: { contains: search, mode: "insensitive" } } : {}),

      // NEW LOGIC:
      // 1. Admins see EVERYTHING.
      // 2. Users see: (Non-blocked content) OR (Their own blocked content).
      ...(userRole !== "ADMIN"
        ? {
            OR: [
              { isBlocked: false },
              { userId: currentUserId }, // Allows the owner to see their "Hidden" message
            ],
          }
        : {}),
    },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          profile_pic_url: true,
          role: true,
        },
      },
      upvoteTracks: currentUserId
        ? { where: { userId: currentUserId } }
        : false,
      reports: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
      replies: {
        // Apply the same OR logic to replies so owners see their blocked replies too
        where:
          userRole !== "ADMIN"
            ? {
                OR: [{ isBlocked: false }, { userId: currentUserId }],
              }
            : {},
        include: {
          user: { select: { userId: true, username: true, role: true } },
          upvoteTracks: currentUserId
            ? { where: { userId: currentUserId } }
            : false,
          reports: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
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

  // Notify parent comment owner when someone replies to their comment
  if (data.parentId) {
    const parent = await prisma.discussion.findUnique({
      where: { id: data.parentId },
      select: { userId: true, content: true, problemId: true },
    });
    // Don't notify if replying to own comment
    if (parent && parent.userId !== data.userId) {
      await createNotification({
        userId: parent.userId,
        type: "SYSTEM",
        title: "New reply to your comment 💬",
        message: `Someone replied to your comment: "${truncate(parent.content)}"`,
        link: `/problems/${parent.problemId}#discussion-${data.parentId}`,
      });
    }
  }

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
  // Verify ownership first
  const existing = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!existing) throw new ServiceError("Discussion not found", 404);
  if (existing.userId !== userId) throw new ServiceError("Not authorized", 403);

  const updated = await prisma.discussion.update({
    where: { id: discussionId },
    data: {
      ...(data.content !== undefined && { content: data.content }),
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
      replies: {
        include: {
          user: { select: { username: true, full_name: true, profile_pic_url: true } },
          upvoteTracks: { where: { userId } },
        },
        orderBy: { createdAt: "asc" },
      },
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
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
  });
  if (!discussion) throw new ServiceError("Discussion not found", 404);
  if (discussion.userId !== userId) throw new ServiceError("Not authorized", 403);

  await prisma.discussion.delete({ where: { id: discussionId } });
  return { success: true };
};

/**
 * Report a discussion. Auto-blocks if reports reach 5.
 */

export const reportDiscussionService = async (
  discussionId: string,
  userId: number,
  reportType: ReportType,
  details?: string,
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the report record
    await tx.discussionReport.create({
      data: {
        userId,
        discussionId,
        reportType,
        details,
      },
    });

    // 2. Increment the count on the discussion
    const updatedStatus = await tx.discussion.update({
      where: { id: discussionId },
      data: { reportCount: { increment: 1 } },
      select: { reportCount: true, isBlocked: true, userId: true, content: true, problemId: true },
    });

    // 3. Notify the comment owner that their comment was reported
    if (updatedStatus.userId !== userId) {
      await createNotification({
        userId: updatedStatus.userId,
        type: "SYSTEM",
        title: "Your comment was reported ⚠️",
        message: `Your comment "${truncate(updatedStatus.content)}" has been reported by a community member.`,
        link: `/problems/${updatedStatus.problemId}#discussion-${discussionId}`,
      });
    }

    // 4. Auto-moderation logic: Block if threshold reached (3 reports)
    const REPORT_THRESHOLD = 3;
    if (
      updatedStatus.reportCount >= REPORT_THRESHOLD &&
      !updatedStatus.isBlocked
    ) {
      await tx.discussion.update({
        where: { id: discussionId },
        data: { isBlocked: true },
      });

      // Notify the owner their comment has been hidden
      await createNotification({
        userId: updatedStatus.userId,
        type: "SYSTEM",
        title: "Your comment has been hidden 🚫",
        message: `Your comment "${truncate(updatedStatus.content)}" has been hidden from the community due to multiple reports. Our moderation team will review it shortly.`,
        link: `/problems/${updatedStatus.problemId}#discussion-${discussionId}`,
      });

      console.log(
        `[AUTO_MOD] Discussion ${discussionId} blocked at ${updatedStatus.reportCount} reports.`,
      );
    }

    // 5. Return the FULL updated discussion object
    return await tx.discussion.findUnique({
      where: { id: discussionId },
      include: {
        user: {
          select: {
            userId: true,
            full_name: true,
            username: true,
            profile_pic_url: true,
          },
        },
        reports: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            upvoteTracks: true,
            reports: true,
          },
        },
      },
    });
  });
};

/**
 * Admin: Get all flagged discussions
 */
/**
 * Admin: Get discussions with high report counts (Threshold: 3+)
 */
export const getFlaggedDiscussionsService = async () => {
  return await prisma.discussion.findMany({
    where: {
      reportCount: { gte: 3 }, // Only show things that actually need attention
    },
    include: {
      user: {
        select: {
          username: true,
          profile_pic_url: true,
        },
      },
      // Include the detailed report logs
      reports: {
        include: {
          user: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { reportCount: "desc" },
  });
};

/**
 * Admin: Moderation Action
 */
/**
 * Admin: Moderation Action
 */
export const moderateDiscussionService = async (
  id: string,
  action: "BLOCK" | "UNBLOCK",
) => {
  // Fetch discussion before transaction so we have content + problemId for notification
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    select: { userId: true, content: true, problemId: true },
  });
  if (!discussion) throw new ServiceError("Discussion not found", 404);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the discussion status
    const updated = await tx.discussion.update({
      where: { id },
      data: {
        isBlocked: action === "BLOCK",
        reportCount: action === "UNBLOCK" ? 0 : undefined,
      },
    });

    // 2. If UNBLOCKING, delete the associated reports so the dashboard stays clean
    if (action === "UNBLOCK") {
      await tx.discussionReport.deleteMany({ where: { discussionId: id } });
      console.log(`ADMIN_ACTION: Discussion ${id} cleared and reports deleted.`);
    }

    return updated;
  });

  // 3. Send notification to comment owner
  if (action === "BLOCK") {
    await createNotification({
      userId: discussion.userId,
      type: "SYSTEM",
      title: "Your comment has been blocked 🚫",
      message: `Your comment "${truncate(discussion.content)}" has been blocked by a moderator for violating community guidelines.`,
      link: `/problems/${discussion.problemId}`,
    });
  } else {
    await createNotification({
      userId: discussion.userId,
      type: "SYSTEM",
      title: "Your comment has been restored ✅",
      message: `Your comment "${truncate(discussion.content)}" has been reviewed and restored by a moderator. It is now visible to the community again.`,
      link: `/problems/${discussion.problemId}#discussion-${id}`,
    });
  }

  return result;
};
