import type { Request, Response, NextFunction } from "express";
import { 
  getByProblem, 
  createDiscussionService, 
  updateDiscussionService, 
  deleteDiscussionService, 
  toggleUpvoteService 
} from "../services/discussion.service.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * GET /api/discussions/problem/:problemId
 */
export const getDiscussions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { problemId } = req.params;
    const userId = (req as any).user?.sub;

    if (!problemId) throw new ServiceError("PROBLEM_ID_REQUIRED", 400);

    const numericId = parseInt(problemId, 10);
    if (isNaN(numericId)) throw new ServiceError("INVALID_PROBLEM_ID_FORMAT", 400);

    const discussions = await getByProblem(numericId, userId);

    res.status(200).json({
      success: true,
      data: discussions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/discussions
 */
export const createDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);

    const { content, problemId, parentId, language } = req.body;
    if (!content || !problemId) throw new ServiceError("REQUIRED_FIELDS_MISSING", 400);

    const post = await createDiscussionService({
      content,
      userId: Number(userId),
      problemId: Number(problemId),
      parentId,
      language
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
export const updateDiscussion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub;
    const { content, language } = req.body;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    const updated = await updateDiscussionService(id, Number(userId), { content, language });

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
export const deleteDiscussion = async (req: Request, res: Response, next: NextFunction) => {
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
export const toggleUpvote = async (req: Request, res: Response, next: NextFunction) => {
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