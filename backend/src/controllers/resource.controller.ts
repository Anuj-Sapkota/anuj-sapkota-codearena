import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { deleteFromCloudinary } from "../lib/cloudinary.js";

export const createSeries = async (req: Request, res: Response) => {
  try {
    const { title, description, price, thumbnail, modules, badgeId } = req.body;

    // 1. Identify and Validate User ID
    // Using (req as any) to bypass strict type checking for the 'user' property
    const rawUserId = (req as any).user?.sub;
    const userId = rawUserId ? parseInt(rawUserId) : null;

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "Unauthorized: Invalid User ID" });
    }

    // 2. Determine Primary Content URL
    // Prisma requires a String for contentUrl. If no modules exist, we use an empty string.
    // 🚀 Update: Added a null-check for 'm.url' to prevent the "missing" error.
    const mainUrl = modules && modules.length > 0 ? modules[0].url || "" : "";

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Create the Parent Resource
      const resource = await tx.resource.create({
        data: {
          title,
          description,
          price: parseFloat(price) || 0,
          previewUrl: thumbnail || "",
          type: "SERIES",
          contentUrl: mainUrl, // This will now always be a String (even if empty)
          badgeId: badgeId || null,
          creatorId: userId,
          isApproved: false,
          isPublished: true,
        },
      });

      // Step B: Create associated Modules if they exist
      if (modules && modules.length > 0) {
        await tx.module.createMany({
          data: modules.map((m: any, index: number) => ({
            title: m.title || `Module ${index + 1}`,
            contentUrl: m.url || "",
            order: index + 1,
            sectionTitle: m.sectionTitle || null,
            resourceId: resource.id,
          })),
        });
      }

      // Final Step: Fetch the complete object with module count to return to frontend
      return await tx.resource.findUnique({
        where: { id: resource.id },
        include: {
          _count: {
            select: { modules: true },
          },
        },
      });
    });

    // 4. Success Response
    return res.status(201).json({
      success: true,
      message: "Series created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Critical Resource Creation Error:", error);

    // Prisma specific error handling
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "A resource with this unique constraint already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to create resource series",
      error: error.message,
    });
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
    const userId = (req as any).user?.sub
      ? parseInt((req as any).user.sub)
      : null;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            completedBy: userId ? { where: { userId } } : false,
          },
        },
        purchases: userId ? { where: { userId } } : false,
      },
    });

    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const isCreator = userId ? resource.creatorId === userId : false;
    const isOwned = isCreator || (userId ? (resource.purchases as any[]).length > 0 : false);

    // Build modules with isCompleted + sequential unlock logic
    // Rule: lesson[0] always unlocked; lesson[i] unlocked if lesson[i-1] isCompleted OR user is creator
    const modulesWithProgress = resource.modules.map((m, index) => {
      const isCompleted = Array.isArray(m.completedBy) && m.completedBy.length > 0;
      const prevCompleted =
        index === 0 ||
        isCreator ||
        (Array.isArray(resource.modules[index - 1].completedBy) &&
          (resource.modules[index - 1].completedBy as any[]).length > 0);

      const isUnlocked = isCreator || prevCompleted;

      return {
        id: m.id,
        title: m.title,
        order: m.order,
        sectionTitle: m.sectionTitle,
        isCompleted,
        isUnlocked,
        // Only expose contentUrl if owned AND unlocked
        contentUrl: isOwned && isUnlocked ? m.contentUrl : null,
      };
    });

    res.json({
      ...resource,
      isOwned,
      isCreator,
      modules: modulesWithProgress,
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
          sectionTitle: m.sectionTitle || null,
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
// backend/controllers/resource.controller.ts

export const getPublicResources = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "");

    // 🚀 1. Get current userId if available (depends on your auth middleware/setup)
    // If this route is behind an optional auth guard, you'll have req.user.id
    const userId = (req as any).user?.sub;
    console.log("User id: ", userId);
    const rawResources = await prisma.resource.findMany({
      where: {
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
        previewUrl: true,
        creatorId: true, // Need this to check if user is the owner/creator
        creator: {
          select: {
            full_name: true,
            username: true,
            profile_pic_url: true,
          },
        },
        // 🚀 2. Check for existing purchase for this specific user
        purchases: userId
          ? {
              where: { userId: userId },
              select: { id: true },
            }
          : false,
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const resources = rawResources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      price: resource.price,
      thumbnail: resource.previewUrl,
      moduleCount: resource._count.modules,
      // 🚀 3. Calculate isOwned
      // It's true if: they bought it OR they are the one who created it
      isOwned: userId
        ? resource.purchases.length > 0 || resource.creatorId === userId
        : false,
      creator: {
        name: resource.creator.full_name,
        avatar: resource.creator.profile_pic_url,
      },
    }));

    return res.status(200).json(resources);
  } catch (error) {
    console.error("❌ DB ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getCreatorStats = async (req: Request, res: Response) => {
  try {
    // 💡 Fix: Ensure userId is parsed correctly as an Integer
    const userId = (req as any).user?.sub
      ? parseInt((req as any).user.sub)
      : null;
    console.log("USER ID for creator stats: ", userId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Fetch total views across ALL resources + resource IDs
    const resourceAggregation = await prisma.resource.aggregate({
      where: { creatorId: userId },
      _sum: {
        views: true, // 🚀 Summing the views column from the Resource table
      },
      _count: {
        id: true,
      },
    });

    // 2. Fetch all purchases for these resources to calculate revenue
    // First, we need the IDs to filter the Purchase table
    const creatorResources = await prisma.resource.findMany({
      where: { creatorId: userId },
      select: { id: true },
    });
    const resourceIds = creatorResources.map((r) => r.id);

    const totalGrossRevenue = await prisma.purchase.aggregate({
      where: { resourceId: { in: resourceIds } },
      _sum: { amount: true },
    });

    const gross = totalGrossRevenue._sum.amount || 0;
    const platformFeeRate = 0.2;
    const creatorEarnings = gross * (1 - platformFeeRate);

    res.status(200).json({
      totalEarnings: creatorEarnings,
      grossRevenue: gross,
      totalResourceViews: resourceAggregation._sum.views || 0, // 🚀 Total views of all content
      resourceCount: resourceAggregation._count.id || 0,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch creator stats" });
  }
};
// backend/controllers/resource.controller.ts

export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.update({
      where: { id: id },
      data: {
        views: { increment: 1 },
      },
      select: { views: true },
    });

    return res.status(200).json({
      success: true,
      currentViews: resource.views,
    });
  } catch (error) {
    console.error("View Track Error:", error);
    return res.status(500).json({ message: "Could not track view" });
  }
};
export const completeModule = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.body;

    // 1. Identify User
    const userId = (req as any).user?.sub
      ? parseInt((req as any).user.sub)
      : null;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 2. Mark module as completed (Upsert prevents duplicates)
    await prisma.userProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      update: {},
      create: { userId, moduleId },
    });

    // 3. CHECK FOR COURSE COMPLETION
    const currentModule = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { resourceId: true },
    });

    if (currentModule) {
      const resourceId = currentModule.resourceId;

      // Get counts for progress calculation
      const totalModules = await prisma.module.count({
        where: { resourceId },
      });

      const completedModules = await prisma.userProgress.count({
        where: {
          userId: userId,
          module: { resourceId },
        },
      });

      const isCourseFinished = totalModules === completedModules;

      // 🚀 4. BADGE AWARDING LOGIC
      if (isCourseFinished) {
        // Find the badge linked to this specific course
        const resource = await prisma.resource.findUnique({
          where: { id: resourceId },
          select: { badgeId: true },
        });

        if (resource?.badgeId) {
          // Award the badge (upsert ensures they don't get the same badge twice)
          await prisma.userBadge.upsert({
            where: {
              userId_badgeId: {
                userId,
                badgeId: resource.badgeId,
              },
            },
            update: {},
            create: {
              userId,
              badgeId: resource.badgeId,
            },
          });
          console.log(`🏆 Badge ${resource.badgeId} awarded to User ${userId}`);
        }
      }

      return res.status(200).json({
        success: true,
        isCourseFinished,
        progress: (completedModules / totalModules) * 100,
        message: isCourseFinished
          ? "Course finished and badge awarded!"
          : "Progress saved",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ Progress Error:", error);
    return res.status(500).json({
      message: "Error saving progress",
      error: error.message,
    });
  }
};
