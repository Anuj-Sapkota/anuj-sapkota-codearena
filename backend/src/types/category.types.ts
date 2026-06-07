/**
 * The core Category model (matches Prisma)
 */
export interface ICategory {
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object (DTO) for creating a category
 * Fields are mandatory for creation
 */
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
}

/**
 * DTO for updating a category
 * All fields are optional because we might only update one
 */
export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
}