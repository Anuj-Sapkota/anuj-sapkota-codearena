import { ServiceError } from "../errors/service.error.js";
import { prisma } from "../lib/prisma.js";
import { findUserRaw } from "./user.service.js";

/**
 * Creates a new category. 
 *
 */
export const createCategoryService = async (adminId: number, data: any) => {
  // 1. Verify the Admin exists in the DB
  await findUserRaw(adminId);

  // 2. Validate input
  const { name, slug, description } = data;
  if (!name || !slug) {
    throw new ServiceError("Name and Slug are required for classification", 400);
  }

  try {
    // 3. Persist to database
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(), // Normalize slugs
        description,
      },
    });

    return newCategory;
  } catch (error: any) {
    // Handle Prisma Unique Constraint (P2002)
    if (error.code === 'P2002') {
      throw new ServiceError("A category with this Name or Slug already exists", 400);
    }
    throw error;
  }
};

/**
 * Fetches a single category by ID with problem counts
 */
export const getCategoryById = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { categoryId },
    include: {
      _count: {
        select: { problems: true } // Technical metadata for the Admin UI
      }
    }
  });

  if (!category) {
    throw new ServiceError("Target category object not found in registry", 404);
  }

  return category;
};