import type { Request, Response, NextFunction } from "express";
import {
  getByProblem,
  createDiscussionService,
  updateDiscussionService,
  deleteDiscussionService,
  toggleUpvoteService,
} from "../services/discussion.service.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * GET /api/discussions/problem/:problemId
 */
export const getDiscussions = async (req: Request, res: Response) => {
  const { problemId } = req.params;
  // Get userId from query params (?userId=123)
  const userId = req.query.userId
    ? parseInt(req.query.userId as string)
    : undefined;

  try {
    const data = await getByProblem(parseInt(problemId), userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
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
