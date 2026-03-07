import type { Request, Response, NextFunction } from "express";
import {
  getByProblem,
  createDiscussionService,
  updateDiscussionService,
  deleteDiscussionService,
  toggleUpvoteService,
  moderateDiscussionService,
  reportDiscussionService,
} from "../services/discussion.service.js";
import { ServiceError } from "../errors/service.error.js";
import  { ReportType } from "../../generated/prisma/client.js";

/**
 * GET /api/discussions/problem/:problemId
 */
export const getDiscussions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { problemId } = req.params;
  const userId = req.query.userId
    ? parseInt(req.query.userId as string)
    : undefined;

  // Extract role from the authenticated user (if logged in)
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
      userRole, // Pass the role here
    );
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

    res.status(201).json({
      success: true,
      message: "DISCUSSION_POSTED",
      data: post,
    });
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
    const userId = (req as any).user?.sub;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    await deleteDiscussionService(id, Number(userId));

    res.status(200).json({
      success: true,
      message: "DISCUSSION_DELETED",
    });
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

    // Validation: Ensure the 'type' provided matches the Enum
    if (!Object.values(ReportType).includes(type as ReportType)) {
      throw new ServiceError("INVALID_REPORT_TYPE", 400);
    }

    const reportedDiscussion = await reportDiscussionService(
      id, 
      Number(userId), 
      type as ReportType, // Cast to Enum type
      details
    );

    console.log("REPORT_INCIDENT_LOGGED: ", reportedDiscussion.id);

    res.status(200).json({
      success: true,
      message: "DISCUSSION_REPORTED",
    });
  } catch (err: any) {
    // Catch Prisma Unique Constraint Error (User reporting same post twice)
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "ALREADY_REPORTED",
      });
    }
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

    // In your actual route file, ensure this is wrapped in an isAdmin middleware
    const updated = await moderateDiscussionService(id, action);

    res.status(200).json({
      success: true,
      message: `DISCUSSION_${action}ED`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
