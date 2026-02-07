import type { Request, Response, NextFunction } from "express";
import {
  createChallengeService,
  getAllChallengesService,
  getChallengeBySlugService,
  updateChallengeService,
  deleteChallengeService,
} from "../services/challenge.service.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * POST /api/challenges
 */
export const createChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = (req as any).user?.sub;
    if (!adminId) throw new ServiceError("AUTH_CONTEXT_MISSING", 401);

    const challenge = await createChallengeService(req.body);

    res.status(201).json({
      success: true,
      message: "CHALLENGE_CREATED_SUCCESSFULLY",
      data: challenge,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/challenges
 */
export const getAllChallenges = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = req.query;

    const results = await getAllChallengesService({
      page: page as string,
      limit: limit as string,
    });

    return res.status(200).json({
      success: true,
      data: results.items,
      meta: results.meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/challenges/:slug
 */
export const getSingleChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params; 
    
    // Type Guard: Narrowing string | undefined -> string
    if (!slug || typeof slug !== "string") {
      throw new ServiceError("SLUG_IDENTIFIER_REQUIRED", 400);
    }

    const challenge = await getChallengeBySlugService(slug);
    
    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/challenges/:challengeId
 */
export const updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { challengeId } = req.params; 
    
    if (!challengeId)
    {
      throw new ServiceError("CHALLENGE_ID_REQUIRED", 400);
    }
    // Convert the URL string "12" into number 12
    const numericId = parseInt(challengeId, 10);
    
    if (isNaN(numericId)) {
      throw new ServiceError("INVALID_CHALLENGE_ID_FORMAT", 400);
    }

    const updatedChallenge = await updateChallengeService(numericId, req.body);

    res.status(200).json({
      success: true,
      message: "CHALLENGE_REGISTRY_UPDATED",
      data: updatedChallenge,
    });
  } catch (err) {
    next(err);
  }
};


/**
 * DELETE /api/challenges/:challengeId
 */
export const deleteChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { challengeId } = req.params;
    
    if (!challengeId) {
      throw new ServiceError("CHALLENGE_ID_REQUIRED", 400);
    }

    const numericId = parseInt(challengeId, 10);
    if (isNaN(numericId)) {
      throw new ServiceError("INVALID_CHALLENGE_ID_FORMAT", 400);
    }

    await deleteChallengeService(numericId);

    res.status(200).json({
      success: true,
      message: "CHALLENGE_DELETED_FROM_REGISTRY",
    });
  } catch (err) {
    next(err);
  }
};