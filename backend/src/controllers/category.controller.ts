import type { Request, Response, NextFunction } from "express";
import {createCategoryService, getById, getAllCategories, update, remove} from "../services/category.service.js";
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

    const newCategory = await createCategoryService(
      adminId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category initialized successfully",
    });
  } catch (err) {
    next(err); // Hands off to your errorHandler middleware
  }
};

/**
 * Handles Fetching a Single Category
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ServiceError("Category ID is required for lookup", 400);
    }

    const category = await getById(Number(id));

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE CATEGORY
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedCategory = await update(Number(id), req.body);
    
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await remove(Number(id));
    
    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};