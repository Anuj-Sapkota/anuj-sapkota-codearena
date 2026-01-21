import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";
import slugifyModule from "slugify";

export const createProblemService = async (data: any) => {
  const {
    title,
    content,
    difficulty,
    timeLimit,
    memoryLimit,
    categoryIds, // Array of Ints
    testCases, // Array of {input, expectedOutput, isSample}
  } = data;

  // 1. Validation
  if (!title || !content || !difficulty) {
    throw new ServiceError("Title, content, and difficulty are required", 400);
  }

  // 2. Slug Generation
  const slugify = (slugifyModule as any).default || slugifyModule;
  const slug = slugify(title, { lower: true, strict: true });

  try {
    return await prisma.problem.create({
      data: {
        title,
        slug,
        content,
        difficulty,
        timeLimit: parseFloat(timeLimit) || 1.0,
        memoryLimit: parseInt(memoryLimit) || 128,
        // Many-to-Many: Connect existing categories by ID
        categories: {
          connect: categoryIds?.map((id: number) => ({ categoryId: id })) || [],
        },
        // One-to-Many: Create test cases as child objects
        testCases: {
          create:
            testCases?.map((tc: any) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isSample: tc.isSample || false,
            })) || [],
        },
      },
      include: {
        categories: true,
        testCases: true,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ServiceError(
        "A problem with this title or slug already exists",
        400,
      );
    }
    throw error;
  }
};

export const getAllProblemsService = async (query: {
  page?: string;
  limit?: string;
  search?: string;
  difficulty?: string;
  categoryIds?: string; // Comma separated string: "1,2,3"
  sortBy?: string;
}) => {
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;

  // 1. Build Dynamic Filter Object
  const where: any = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  if (query.difficulty && query.difficulty !== 'ALL') {
    where.difficulty = query.difficulty;
  }

  if (query.categoryIds) {
    const ids = query.categoryIds.split(',').map(id => parseInt(id));
    where.categories = {
      some: { categoryId: { in: ids } }
    };
  }

  // 2. Sorting Logic
  let orderBy: any = { createdAt: 'desc' };
  if (query.sortBy === 'title_asc') orderBy = { title: 'asc' };
  if (query.sortBy === 'title_desc') orderBy = { title: 'desc' };

  // 3. Execute Transaction (Get data + Total count in one go)
  const [items, total] = await prisma.$transaction([
    prisma.problem.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        categories: { select: { name: true, categoryId: true } },
        _count: { select: { submissions: true } }
      }
    }),
    prisma.problem.count({ where })
  ]);

  return {
    items,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getProblemBySlug = async (slug: string) => {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      categories: true,
      testCases: {
        where: { isSample: true }, // Only return sample cases to the client
      },
    },
  });

  if (!problem) {
    throw new ServiceError("Problem not found", 404);
  }
  return problem;
};

// Inside problem.service.ts -> updateProblemService
export const updateProblemService = async (id: string, data: any) => {
  const {
    title,
    content,
    difficulty,
    timeLimit,
    memoryLimit,
    categoryIds,
    testCases,
  } = data;

  const slugify = (slugifyModule as any).default || slugifyModule;
  const numericId = parseInt(id);

  const updateData: any = {};

  if (title) {
    updateData.title = title;
    updateData.slug = slugify(title, { lower: true, strict: true });
  }
  if (content) updateData.content = content;
  if (difficulty) updateData.difficulty = difficulty;

  if (timeLimit !== undefined && timeLimit !== null) {
    updateData.timeLimit = parseFloat(timeLimit);
  }
  if (memoryLimit !== undefined && memoryLimit !== null) {
    updateData.memoryLimit = parseInt(memoryLimit);
  }

  // Handle categories - ADDED FILTERING HERE
  if (categoryIds && Array.isArray(categoryIds)) {
    const validCategoryIds = categoryIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id !== 0); // Remove bad IDs

    updateData.categories = {
      set: validCategoryIds.map((id: number) => ({ categoryId: id })),
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Update basic info
      await tx.problem.update({
        where: { problemId: numericId },
        data: updateData,
      });

      // Update Test Cases
      if (testCases && Array.isArray(testCases)) {
        await tx.testCase.deleteMany({
          where: { problemId: numericId },
        });

        // Use create instead of createMany if you have issues with some DBs,
        // but createMany is fine for Postgres/MySQL
        await tx.testCase.createMany({
          data: testCases.map((tc: any) => ({
            problemId: numericId,
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            isSample: tc.isSample || false,
          })),
        });
      }

      return tx.problem.findUnique({
        where: { problemId: numericId },
        include: { categories: true, testCases: true },
      });
    });
  } catch (error: any) {
    console.error("PRISMA_UPDATE_ERROR:", error); // Log the actual error for debugging
    if (error.code === "P2025")
      throw new ServiceError("Problem record not found", 404);
    throw error;
  }
};

export const deleteProblemService = async (id: string) => {
  const numericId = parseInt(id);
  try {
    return await prisma.problem.delete({
      where: { problemId: numericId },
    });
  } catch (error: any) {
    if (error.code === "P2025")
      throw new ServiceError("Problem record not found", 404);
    throw error;
  }
};
