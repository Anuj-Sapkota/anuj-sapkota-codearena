import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

export const createProblemService = async (data: any) => {
  const {
    title,
    content,
    difficulty,
    timeLimit,
    functionName,
    starterCode,
    memoryLimit,
    categoryIds, // Array of Ints
    testCases, // Array of {input, expectedOutput, isSample}
  } = data;

  // 1. Validation
  if (!title || !content || !difficulty) {
    throw new ServiceError("Title, content, and difficulty are required", 400);
  }

  try {
    return await prisma.problem.create({
      data: {
        title,
        content,
        difficulty,
        functionName: functionName || "solution",
        starterCode: starterCode || {
          javascript: "",
          python: "",
          java: "",
          cpp: "",
        },
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
      throw new ServiceError("A problem with this title already exists", 400);
    }
    throw error;
  }
};
export const getAllProblemsService = async (query: {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string | undefined;
  difficulty?: string | undefined;
  categoryIds?: string | undefined;
  sortBy?: string | undefined;
  userId?: number | undefined;
  status?: string | undefined; // New: Filter by 'SOLVED', 'ATTEMPTED', or 'UNSOLVED'
}) => {
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;

  const where: any = {};

  // 1. Search Filter
  if (query.search) {
    where.OR = [{ title: { contains: query.search, mode: "insensitive" } }];
  }

  // 2. Difficulty Filter
  if (query.difficulty && query.difficulty !== "ALL") {
    where.difficulty = query.difficulty;
  }

  // 3. Category Filter
  if (query.categoryIds) {
    const ids = query.categoryIds.split(",").map((id) => parseInt(id));
    where.categories = {
      some: { categoryId: { in: ids } },
    };
  }

  // 4. Status Filter (Advanced Logic)
  // If the user wants to see only Solved/Attempted, we filter based on existence of submissions
  if (query.userId && query.status) {
    const statusFilter = query.status.toUpperCase(); // Force uppercase to match frontend
    const uId = Number(query.userId);

    if (statusFilter === "SOLVED") {
      where.submissions = {
        some: { userId: uId, status: "ACCEPTED" },
      };
    } else if (statusFilter === "ATTEMPTED") {
      where.submissions = {
        some: { userId: uId }, // User has tried at least once
        none: { userId: uId, status: "ACCEPTED" }, // But has NOT succeeded yet
      };
    } else if (statusFilter === "UNSOLVED") {
      where.submissions = {
        none: { userId: uId }, // User has zero submissions
      };
    }
  }

  let orderBy: any = { createdAt: "desc" };
  if (query.sortBy === "title_asc") orderBy = { title: "asc" };
  if (query.sortBy === "title_desc") orderBy = { title: "desc" };

  const [items, total] = await prisma.$transaction([
    prisma.problem.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        categories: { select: { name: true, categoryId: true } },
        _count: { select: { submissions: true } },
        testCases: true, // <--- ADD THIS LINE RIGHT HERE
        submissions: query.userId
          ? {
              where: { userId: query.userId },
              select: { status: true },
            }
          : false,
      },
    }),
    prisma.problem.count({ where }),
  ]);

  // 5. Formatting Logic
  const formattedItems = items.map((problem) => {
    const { submissions, _count, ...rest } = problem as any;

    let status = "UNSOLVED";
    if (submissions && submissions.length > 0) {
      const hasAccepted = submissions.some((s: any) => s.status === "ACCEPTED");
      status = hasAccepted ? "SOLVED" : "ATTEMPTED";
    }

    return {
      ...rest,
      status, // Returns 'SOLVED', 'ATTEMPTED', or 'UNSOLVED'
      isSolved: status === "SOLVED",
      submissionCount: _count.submissions,
    };
  });

  return {
    items: formattedItems,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};
export const getProblemById = async (id: number, isAdmin: boolean = false) => {
  const problem = await prisma.problem.findUnique({
    where: { problemId: id },
    include: {
      categories: true,
      testCases: isAdmin 
        ? true  // Admins see all test cases
        : { where: { isSample: true } }, // Users only see samples
    },
  });

  if (!problem) throw new ServiceError("Problem not found", 404);
  return problem;
};

// Inside problem.service.ts -> updateProblemService
export const updateProblemService = async (id: string, data: any) => {
  const {
    title,
    content,
    difficulty,
    timeLimit,
    functionName,
    starterCode,
    memoryLimit,
    categoryIds,
    testCases,
  } = data;

  const numericId = parseInt(id);

  const updateData: any = {};

  if (title) {
    updateData.title = title;
  }
  if (content) updateData.content = content;
  if (difficulty) updateData.difficulty = difficulty;
  if (functionName) updateData.functionName = functionName;
  if (starterCode !== undefined) updateData.starterCode = starterCode || {};
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
