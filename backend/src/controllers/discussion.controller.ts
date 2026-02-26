import type { Request, Response, NextFunction } from "express";
import { DiscussionService } from "../services/discussion.service.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * GET /api/discussions/problem/:problemId
 * Fetches all top-level discussions for a problem
 */
export const getDiscussions = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { problemId } = req.params;
    const userId = (req as any).user?.sub; // Optional: current user's ID for upvote status

    if (!problemId) {
      throw new ServiceError("PROBLEM_ID_REQUIRED", 400);
    }

    const numericProblemId = parseInt(problemId, 10);
    if (isNaN(numericProblemId)) {
      throw new ServiceError("INVALID_PROBLEM_ID_FORMAT", 400);
    }

    const discussions = await DiscussionService.getByProblem(numericProblemId, userId);

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
 * Creates a new discussion post or a reply
 */
export const createDiscussion = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);

    const { content, problemId, parentId, language } = req.body;

    if (!content || !problemId) {
      throw new ServiceError("CONTENT_AND_PROBLEM_ID_REQUIRED", 400);
    }

    const post = await DiscussionService.create({
      content,
      userId: Number(userId),
      problemId: Number(problemId),
      parentId,
      language
    });

    res.status(201).json({
      success: true,
      message: "DISCUSSION_POSTED_SUCCESSFULLY",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/discussions/:id/upvote
 * Toggles an upvote for a specific discussion
 */
export const toggleUpvote = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params; // discussion ID
    const userId = (req as any).user?.sub;

    if (!userId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);
    if (!id) throw new ServiceError("DISCUSSION_ID_REQUIRED", 400);

    const updatedDiscussion = await DiscussionService.toggleUpvote(id, Number(userId));

    res.status(200).json({
      success: true,
      message: "UPVOTE_TOGGLED",
      data: updatedDiscussion,
    });
  } catch (err) {
    next(err);
  }
};