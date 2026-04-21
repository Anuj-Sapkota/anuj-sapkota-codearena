import type { Request, Response, NextFunction } from "express";
import {
  getByProblem,
  createDiscussionService,
  updateDiscussionService,
  deleteDiscussionService,
  toggleUpvoteService,
  moderateDiscussionService,
  reportDiscussionService,
  getFlaggedDiscussionsService,
} from "../services/discussion.service.js";
import { ServiceError } from "../errors/service.error.js";
import { ReportType } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notification.service.js";
import { truncate } from "../utils/truncate.util.js";

/**
 * GET /api/discussions/problem/:problemId
 */
export const getDiscussions = async (req: Request, res: Response, next: NextFunction) => {
  const { problemId } = req.params;
  // Use the authenticated user's ID from the JWT — not a spoofable query param
  const userId = (req as any).user?.sub ? Number((req as any).user.sub) : undefined;
  const userRole = (req as any).user?.role;
  const sortBy = req.query.sortBy as "newest" | "most_upvoted" | undefined;
  const language = req.query.language as string | undefined;
  const search = req.query.search as string | undefined;

  try {
    const data = await getByProblem(
      parseInt(problemId!),
      userId,
      sortBy,
      language,
      search,
      userRole,
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/discussions/flagged (ADMIN ONLY)
 */
export const getFlaggedDiscussions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "ADMIN") throw new ServiceError("FORBIDDEN_ACCESS", 403);

    const data = await getFlaggedDiscussionsService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/discussions
 */
export const createDiscussion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);

    const { content, problemId, parentId, language } = req.body;
    if (!content || !problemId)
      throw new ServiceError("REQUIRED_FIELDS_MISSING", 400);

    const post = await createDiscussionService({
      content,
      userId: Number(userId),
      problemId: Number(problemId),
      parentId,
      language,
    });

    res
      .status(201)
      .json({ success: true, message: "DISCUSSION_POSTED", data: post });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/discussions/:id
 */
export const updateDiscussion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub;
    const { content, language } = req.body;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    const updated = await updateDiscussionService(id, Number(userId), {
      content,
      language,
    });

    res.status(200).json({
      success: true,
      message: "DISCUSSION_UPDATED",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/discussions/:id
 */
export const deleteDiscussion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = Number((req as any).user?.sub);
    const userRole = (req as any).user?.role;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    // Admins can delete any comment — fetch it first to notify the owner
    if (userRole === "ADMIN") {
      const discussion = await prisma.discussion.findUnique({
        where: { id },
        include: { problem: { select: { title: true } } },
      });
      if (!discussion) throw new ServiceError("Discussion not found", 404);

      await prisma.discussion.delete({ where: { id } });

      // Notify the comment owner if admin deleted someone else's comment
      if (discussion.userId !== userId) {
        await createNotification({
          userId: discussion.userId,
          type: "SYSTEM",
          title: "Your comment was removed 🗑️",
          message: `Your comment "${truncate(discussion.content)}" on "${discussion.problem.title}" was removed by a moderator due to community guideline violations.`,
          link: `/problems/${discussion.problemId}`,
        });
      }
    } else {
      await deleteDiscussionService(id, userId);
    }

    res.status(200).json({ success: true, message: "DISCUSSION_DELETED" });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/discussions/:id/upvote
 */
export const toggleUpvote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    const updated = await toggleUpvoteService(id, Number(userId));

    res.status(200).json({
      success: true,
      message: "UPVOTE_TOGGLED",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/discussions/:id/moderate (ADMIN ONLY)
 */
export const moderateDiscussion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "BLOCK" | "UNBLOCK"

    const updated = await moderateDiscussionService(id, action);

    res.status(200).json({
      success: true,
      message: `DISCUSSION_${action}ED`,
      data: updated, // Returning updated object for Redux tree sync
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/discussions/:id/report
 */
export const reportDiscussion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub;
    const { type, details } = req.body;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);

    if (!Object.values(ReportType).includes(type as ReportType)) {
      throw new ServiceError("INVALID_REPORT_TYPE", 400);
    }

    const updatedDiscussion = await reportDiscussionService(
      id,
      Number(userId),
      type as ReportType,
      details,
    );

    res.status(200).json({
      success: true,
      // We send a dynamic message based on the result
      message: updatedDiscussion.isBlocked
        ? "CONTENT_HIDDEN_FOR_REVIEW"
        : "REPORT_SUBMITTED",
      data: updatedDiscussion,
    });
  } catch (err: any) {
    // Prisma error for unique constraint (userId + discussionId)
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "ALREADY_REPORTED",
      });
    }
    next(err);
  }
};
