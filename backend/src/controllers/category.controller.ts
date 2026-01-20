import type { Request, Response, NextFunction } from "express";
import * as CategoryService from "../services/category.service.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * Handles Category Creation
 * Identity is verified via the authenticateRequest middleware
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Accessing sub from the decoded token (attached by middleware)
    const adminId = (req as any).user?.sub;

    if (!adminId) {
      throw new ServiceError("Authentication context missing", 401);
    }

    const newCategory = await CategoryService.createCategoryService(adminId, req.body);

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category initialized successfully"
    });
  } catch (err) {
    next(err); // Hands off to your errorHandler middleware
  }
};

/**
 * Handles Fetching a Single Category
 */
export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ServiceError("Category ID is required for lookup", 400);
    }

    const category = await CategoryService.getCategoryById(Number(id));

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};