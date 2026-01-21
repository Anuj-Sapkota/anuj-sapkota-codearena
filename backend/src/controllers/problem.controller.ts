import type { Request, Response, NextFunction } from "express";
import {
  createProblemService,
  getAllProblemsService,
  getProblemBySlug,
  deleteProblemService,
  updateProblemService
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
    const { 
      page, 
      limit, 
      search, 
      difficulty, 
      categoryIds, 
      sortBy 
    } = req.query;

    // Convert query strings to the format the service needs
    const results = await getAllProblemsService({
      page: page as string,
      limit: limit as string,
      search: search as string,
      difficulty: difficulty as string,
      categoryIds: categoryIds as string,
      sortBy: sortBy as string,
    });

    // Return the items along with the 'meta' (pagination info)
    return res.status(200).json({
      success: true,
      data: results.items,
      meta: results.meta
    });
  } catch (error: any) {
    console.error("GET_ALL_PROBLEMS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during challenge retrieval"
    });
  }
};

export const getSingleProblem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw new ServiceError("Problem slug is required for lookup", 400);
    }
    const problem = await getProblemBySlug(slug);
    res.status(200).json({
      success: true,
      data: problem,
    });
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