import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

/**
 * Creates a challenge using the provided slug.
 */
export const createChallengeService = async (data: any) => {
  const {
    title,
    slug,
    description,
    bannerUrl,
    isPublic,
    startTime,
    endTime,
    problemIds,
  } = data;

  if (!title || !slug) {
    throw new ServiceError("TITLE_AND_SLUG_REQUIRED", 400);
  }

  try {
    return await prisma.challenge.create({
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        description,
        bannerUrl,
        isPublic: isPublic || false,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        problems: {
          create:
            problemIds?.map((id: number, index: number) => ({
              problemId: id,
              order: index + 1,
            })) || [],
        },
      },
      include: {
        // Included problems array so the UI updates immediately after creation
        problems: true,
        _count: { select: { problems: true } },
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ServiceError("CHALLENGE_SLUG_ALREADY_EXISTS", 400);
    }
    throw error;
  }
};

/**
 * Fetches challenges with server-side pagination.
 * FIXED: Now includes 'problems' so the Edit Modal can see linked IDs.
 */
export const getAllChallengesService = async ({
  page,
  limit,
}: {
  page?: string;
  limit?: string;
}) => {
  const p = parseInt(page || "1");
  const l = parseInt(limit || "10");
  const skip = (p - 1) * l;

  try {
    const [items, total] = await Promise.all([
      prisma.challenge.findMany({
        skip,
        take: l,
        include: {
          // THIS IS THE CRITICAL FIX:
          // Ensuring the problems (Join Table) are included in the list view
          problems: true,
          _count: { select: { problems: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.challenge.count(),
    ]);

    return {
      items,
      meta: { total, page: p, limit: l, pages: Math.ceil(total / l) },
    };
  } catch (error: any) {
    throw new ServiceError("FAILED_TO_FETCH_CHALLENGES", 500);
  }
};

/**
 * Retrieves a single challenge via its unique slug (Public Use).
 */
export const getChallengeBySlugService = async (slug: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { slug },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: { problem: true },
      },
    },
  });

  if (!challenge) {
    throw new ServiceError(`CHALLENGE_NOT_FOUND`, 404);
  }

  return challenge;
};

/**
 * Updates challenge via Numeric ID (Administrative Use).
 */
export const updateChallengeService = async (
  challengeId: number,
  data: any,
) => {
  const { problemIds, ...updateData } = data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Update main record
      await tx.challenge.update({
        where: { challengeId },
        data: {
          ...updateData,
          slug: updateData.slug
            ? updateData.slug.toLowerCase().trim().replace(/\s+/g, "-")
            : undefined,
          startTime: updateData.startTime
            ? new Date(updateData.startTime)
            : undefined,
          endTime: updateData.endTime
            ? new Date(updateData.endTime)
            : undefined,
        },
      });

      // 2. Sync problems (Delete old, Create new)
      if (problemIds) {
        await tx.challengeProblem.deleteMany({
          where: { challengeId },
        });

        if (problemIds.length > 0) {
          await tx.challengeProblem.createMany({
            data: problemIds.map((pId: number, index: number) => ({
              challengeId,
              problemId: pId,
              order: index + 1,
            })),
          });
        }
      }

      // 3. Return the complete updated object
      return await tx.challenge.findUnique({
        where: { challengeId },
        include: {
          problems: true,
          _count: { select: { problems: true } },
        },
      });
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new ServiceError("CHALLENGE_NOT_FOUND", 404);
    }
    if (error.code === "P2002") {
      throw new ServiceError("NEW_SLUG_ALREADY_IN_USE", 400);
    }
    throw error;
  }
};

/**
 * Deletes a challenge via Numeric ID.
 */
export const deleteChallengeService = async (challengeId: number) => {
  try {
    return await prisma.challenge.delete({
      where: { challengeId },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new ServiceError("CHALLENGE_NOT_FOUND", 404);
    }
    throw error;
  }
};
