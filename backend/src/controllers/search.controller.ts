import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/search?q=keyword
// Returns problems, resources, and challenges matching the query
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q || q.length < 2) return res.json({ problems: [], resources: [], challenges: [] });

    const [problems, resources, challenges] = await Promise.all([
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
          ],
        },
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
        where: {
          isPublic: true,
          title: { contains: q, mode: "insensitive" },
        },
        select: { challengeId: true, title: true, slug: true, difficulty: true, points: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ problems, resources, challenges });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
