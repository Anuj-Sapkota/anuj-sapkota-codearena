import { ServiceError } from "../errors/service.error.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateCategoryDTO,
  ICategory,
  UpdateCategoryDTO,
} from "../types/category.types.js";
import { findUserRaw } from "./user.service.js";

/**
 * Creates a new category.
 *
 */
export const createCategoryService = async (
  adminId: number,
  data: CreateCategoryDTO,
): Promise<ICategory> => {
  // 1. Verify the Admin exists in the DB
  await findUserRaw(adminId);

  // 2. Validate input
  const { name, slug, description } = data;
  if (!name || !slug) {
    throw new ServiceError(
      "Name and Slug are required for classification",
      400,
    );
  }

  try {
    // 3. Persist to database
    const newCategory = await prisma.category.create({
      data: {
        name: name,
        slug: slug.toLowerCase().trim(), // Normalize slugs
        description: description || "",
      },
    });

    return newCategory;
  } catch (error: any) {
    // Handle Prisma Unique Constraint (P2002)
    if (error.code === "P2002") {
      throw new ServiceError(
        "A category with this Name or Slug already exists",
        400,
      );
    }
    throw error;
  }
};

/**
 * Fetches a single category by ID with problem counts
 */
export const getById = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { categoryId },
    include: {
      _count: {
        select: { problems: true }, // Technical metadata for the Admin UI
      },
    },
  });

  if (!category) {
    throw new ServiceError("Target category object not found in registry", 404);
  }

  return category;
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { problems: true }, // This powers the "Usage" count in your UI
      },
    },
    orderBy: {
      createdAt: "desc", // Newest categories first
    },
  });
};

export const update = async (
  id: number,
  data: UpdateCategoryDTO,
): Promise<ICategory> => {
  // Build a safe OR array only for values that exist
  const orConditions = [];
  if (data.name) orConditions.push({ name: data.name });
  if (data.slug) orConditions.push({ slug: data.slug });

  if (orConditions.length > 0) {
    const duplicate = await prisma.category.findFirst({
      where: {
        OR: orConditions,
        NOT: { categoryId: id },
      },
    });

    if (duplicate) {
      throw new ServiceError("Category name or slug already in use", 400);
    }
  }

  return await prisma.category.update({
    where: { categoryId: id },
    data,
  });
};

export const remove = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { categoryId: id },
    include: { _count: { select: { problems: true } } },
  });

  if (category?._count.problems && category._count.problems > 0) {
    throw new Error("Cannot delete category with existing problems");
  }

  return await prisma.category.delete({ where: { categoryId: id } });
};
