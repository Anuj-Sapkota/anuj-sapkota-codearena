import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { deleteFromCloudinary } from "../lib/cloudinary.js";

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

// backend/src/controllers/resource.controller.ts

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.sub ? parseInt((req as any).user.sub) : null;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { order: "asc" } },
        purchases: userId ? { where: { userId: userId } } : false,
      },
    });

    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // 🛠️ FIX: Creator can always view their own contentUrl
    const isOwned = userId 
      ? (resource.purchases.length > 0 || resource.creatorId === userId) 
      : false;

    res.json({
      ...resource,
      isOwned,
      modules: isOwned
        ? resource.modules
        : resource.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            contentUrl: null, 
            order: m.order,
          })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching resource" });
  }
};

// backend/controllers/resource.controller.ts
// --- DELETE RESOURCE ---
export const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.sub;

  try {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { modules: true },
    });

    if (!resource || resource.creatorId !== Number(userId)) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }

    // 1. Delete all module videos from Cloudinary
    for (const mod of resource.modules) {
      await deleteFromCloudinary(mod.contentUrl, "video");
    }

    // 2. Delete thumbnail from Cloudinary
    if (resource.previewUrl) {
      await deleteFromCloudinary(resource.previewUrl, "image");
    }

    // 3. Delete from DB (onDelete: Cascade in Prisma handles the Module rows)
    await prisma.resource.delete({ where: { id } });

    res.json({ message: "Resource and cloud assets deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

// --- UPDATE RESOURCE ---
export const updateResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, price, thumbnail, modules } = req.body;
  const userId = (req as any).user.sub;

  try {
    const oldResource = await prisma.resource.findUnique({
      where: { id },
      include: { modules: true },
    });

    if (!oldResource || oldResource.creatorId !== Number(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🚀 CLOUDINARY CLEANUP
    // Identify modules that were removed in the UI
    const removedModules = oldResource.modules.filter(
      (oldMod) =>
        !modules.find((newMod: any) => newMod.url === oldMod.contentUrl),
    );

    for (const mod of removedModules) {
      await deleteFromCloudinary(mod.contentUrl, "video");
    }

    // If thumbnail changed, delete the old one
    if (thumbnail !== oldResource.previewUrl && oldResource.previewUrl) {
      await deleteFromCloudinary(oldResource.previewUrl, "image");
    }

    // 🚀 DATABASE SYNC (Atomic Transaction)
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Main Info
      const resUpdate = await tx.resource.update({
        where: { id },
        data: {
          title,
          description,
          price: Number(price),
          previewUrl: thumbnail,
        },
      });

      // 2. Wipe old modules and replace with the new ordered list
      await tx.module.deleteMany({ where: { resourceId: id } });
      await tx.module.createMany({
        data: modules.map((m: any, index: number) => ({
          title: m.title,
          contentUrl: m.url,
          order: index,
          resourceId: id,
        })),
      });

      return resUpdate;
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
// backend/controllers/resource.controller.ts

export const getPublicResources = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "");

    const rawResources = await prisma.resource.findMany({
      where: {
        isPublished: true, // Only show published courses
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        previewUrl: true, // 👈 Corrected from 'thumbnail' to 'previewUrl'
        creator: {
          select: {
            full_name: true,
            username: true,
            profile_pic_url: true,
          },
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🚀 Bridge the DB to the Frontend
    const resources = rawResources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      // We map 'previewUrl' to 'thumbnail' so your frontend code doesn't have to change
      thumbnail: resource.previewUrl,
      moduleCount: resource._count.modules,
      creator: {
        name: resource.creator.full_name, // Maps full_name to name
        avatar: resource.creator.profile_pic_url,
      },
    }));

    return res.status(200).json(resources);
  } catch (error) {
    console.error("❌ DB ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
