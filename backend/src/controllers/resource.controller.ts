import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const createSeries = async (req: Request, res: Response) => {
  try {
    const { title, description, price, thumbnail, modules } = req.body;

    // Convert sub to Int for the creatorId relation
    const rawUserId = (req as any).user?.sub;
    const userId = rawUserId ? parseInt(rawUserId) : null;

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "Unauthorized: Invalid User ID" });
    }

    // Use the first video URL as the primary contentUrl
    const mainUrl = modules && modules.length > 0 ? modules[0].url : "";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Parent Resource
      const resource = await tx.resource.create({
        data: {
          title,
          description,
          price: Number(price),
          previewUrl: thumbnail, // Mapping frontend 'thumbnail' to schema 'previewUrl'
          type: "SERIES", // ✅ This will now work!
          contentUrl: mainUrl,
          creatorId: userId,
          isApproved: false,
        },
      });

      // 2. Create the Modules (Ensure you added the Module model to your schema!)
      if (modules && modules.length > 0) {
        await (tx as any).module.createMany({
          data: modules.map((m: any, index: number) => ({
            title: m.title,
            contentUrl: m.url,
            order: index,
            resourceId: resource.id,
          })),
        });
      }

      return resource;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Resource Creation Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getMyResources = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub
      ? parseInt((req as any).user.sub)
      : null;

    const resources = await prisma.resource.findMany({
      where: { creatorId: userId as number },
      include: {
        _count: {
          select: { modules: true }, // This shows how many videos are in the series
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 🛡️ SECURITY & TYPE FIX: Explicitly check for ID
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid Resource ID is required" });
    }

    const resource = await prisma.resource.findUnique({
      where: {
        id: id, // TypeScript now knows 'id' is definitely a string here
      },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { purchases: true },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    console.error("Fetch Resource Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
