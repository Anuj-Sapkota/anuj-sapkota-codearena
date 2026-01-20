export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    problems: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryState {
  items: Category[];
  isLoading: boolean;
  error: string | null;
}

// DTOs for Actions
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
}