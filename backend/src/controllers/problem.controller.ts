import type { Request, Response, NextFunction } from "express";
import {
  createProblemService,
  getAllProblemsService,
  getProblemById,
  deleteProblemService,
  updateProblemService,
} from "../services/problem.service.js";
import { ServiceError } from "../errors/service.error.js";

export const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = (req as any).user?.sub;
    if (!adminId) throw new ServiceError("Authentication context missing", 401);

    const problem = await createProblemService(req.body);

    res.status(201).json({
      success: true,
      message: "Problem created and test cases mapped",
      data: problem,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/problems
 * Fetches problems with server-side pagination, search, and filtering.
 */
export const getAllProblems = async (req: Request, res: Response) => {
  try {
    // 1. Extract 'userId' and 'status' from query parameters explicitly
    const {
      page,
      limit,
      search,
      difficulty,
      categoryIds,
      sortBy,
      status,
      userId: queryUserId, // Rename to avoid conflict
    } = req.query;

    // 2. Determine the User ID
    // Priority: Authenticated Token (req.user) > Query Param (?userId=123)
    const tokenUserId = (req as any).user?.userId;
    const effectiveUserId = tokenUserId
      ? Number(tokenUserId)
      : queryUserId
        ? Number(queryUserId)
        : undefined;

    // 3. Call Service
    const results = await getAllProblemsService({
      page: page as string,
      limit: limit as string,
      search: search as string,
      difficulty: difficulty as string,
      categoryIds: categoryIds as string,
      sortBy: sortBy as string,
      status: status as string, // Pass the status string ('SOLVED', 'ATTEMPTED')
      userId: effectiveUserId, // Pass the resolved User ID
    });

    return res.status(200).json({
      success: true,
      data: results.items,
      meta: results.meta,
    });
  } catch (error: any) {
    console.error("GET_ALL_PROBLEMS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getSingleProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Check if the requester is an admin (based on your auth middleware)
    const isAdmin = (req as any).user?.role === 'ADMIN'; 

    const problem = await getProblemById(Number(id), isAdmin);
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

export const updateProblem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params; // Assuming you use ID for updates
    if (!id) throw new ServiceError("Problem ID is required", 400);

    // We pass the ID and the new body to the service
    const updatedProblem = await updateProblemService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Problem_Registry_Updated",
      data: updatedProblem,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProblem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new ServiceError("Problem ID is required", 400);

    await deleteProblemService(id);

    res.status(200).json({
      success: true,
      message: "Problem_Deleted_From_Registry",
    });
  } catch (err) {
    next(err);
  }
};
