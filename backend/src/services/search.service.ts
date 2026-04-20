import { prisma } from "../lib/prisma.js";

export const globalSearchService = async (q: string) => {
  const [problems, resources, challenges] = await Promise.all([
    prisma.problem.findMany({
      where: { OR: [{ title: { contains: q, mode: "insensitive" } }] },
      select: { problemId: true, title: true, difficulty: true, points: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, previewUrl: true, price: true },
      take: 4,
      orderBy: { views: "desc" },
    }),
    prisma.challenge.findMany({
      where: { isPublic: true, title: { contains: q, mode: "insensitive" } },
      select: { challengeId: true, title: true, slug: true, difficulty: true, points: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { problems, resources, challenges };
};
