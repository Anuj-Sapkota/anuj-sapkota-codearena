import { prisma } from "../lib/prisma.js";
import { deleteFromCloudinary } from "../lib/cloudinary.js";
import { ServiceError } from "../errors/service.error.js";

export const createSeriesService = async (userId: number, data: any) => {
  const { title, description, price, thumbnail, modules, badgeId } = data;
  const mainUrl = modules?.length > 0 ? modules[0].url || "" : "";

  return prisma.$transaction(async (tx) => {
    const resource = await tx.resource.create({
      data: {
        title, description,
        price: parseFloat(price) || 0,
        previewUrl: thumbnail || "",
        type: "SERIES",
        contentUrl: mainUrl,
        badgeId: badgeId || null,
        creatorId: userId,
        isApproved: false,
        isPublished: true,
      },
    });

    if (modules?.length > 0) {
      await tx.module.createMany({
        data: modules.map((m: any, index: number) => ({
          title: m.title || `Module ${index + 1}`,
          description: m.description || null,
          contentUrl: m.url || "",
          fileType: m.fileType || "video",
          fileName: m.fileName || null,
          order: index + 1,
          sectionTitle: m.sectionTitle || null,
          resourceId: resource.id,
        })),
      });
    }

    return tx.resource.findUnique({
      where: { id: resource.id },
      include: { _count: { select: { modules: true } } },
    });
  });
};

export const getMyResourcesService = async (userId: number) => {
  return prisma.resource.findMany({
    where: { creatorId: userId },
    include: { _count: { select: { modules: true, purchases: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getResourceDashboardService = async (resourceId: string, userId: number) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      modules: { orderBy: { order: "asc" } },
      purchases: {
        include: {
          user: {
            select: {
              userId: true, full_name: true, username: true,
              profile_pic_url: true, created_at: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      badge: { select: { id: true, name: true, iconUrl: true } },
      assignment: {
        select: {
          id: true, passScore: true,
          _count: { select: { questions: true, attempts: true } },
        },
      },
    },
  });

  if (!resource || resource.creatorId !== userId)
    throw new ServiceError("Unauthorized", 403);

  const grossRevenue = resource.purchases.reduce((sum, p) => sum + p.amount, 0);
  const creatorEarnings = grossRevenue * 0.8;
  const passedAttempts = resource.assignment
    ? await prisma.assignmentAttempt.count({
        where: { assignmentId: resource.assignment.id, passed: true },
      })
    : 0;

  return {
    ...resource,
    stats: {
      views: resource.views,
      students: resource.purchases.length,
      grossRevenue,
      creatorEarnings,
      passedAssignment: passedAttempts,
    },
  };
};

export const getResourceByIdService = async (resourceId: string, userId: number | null) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          completedBy: userId ? { where: { userId } } : false,
        },
      },
      purchases: userId ? { where: { userId } } : false,
      assignment: {
        select: {
          id: true, passScore: true,
          _count: { select: { questions: true } },
          attempts: userId
            ? { where: { userId, passed: true }, select: { id: true }, take: 1 }
            : false,
        },
      },
      badge: { select: { id: true, name: true, iconUrl: true, description: true } },
      creator: { select: { full_name: true } },
    },
  });

  if (!resource) throw new ServiceError("Resource not found", 404);

  const isCreator = userId ? resource.creatorId === userId : false;
  const isOwned = isCreator || (userId ? (resource.purchases as any[]).length > 0 : false);

  const modulesWithProgress = resource.modules.map((m, index) => {
    const isCompleted = Array.isArray(m.completedBy) && m.completedBy.length > 0;
    const prevCompleted =
      index === 0 ||
      isCreator ||
      (Array.isArray(resource.modules[index - 1].completedBy) &&
        (resource.modules[index - 1].completedBy as any[]).length > 0);

    return {
      id: m.id, title: m.title, description: m.description,
      order: m.order, sectionTitle: m.sectionTitle,
      fileType: m.fileType, fileName: m.fileName,
      isCompleted,
      isUnlocked: isCreator || prevCompleted,
      contentUrl: isOwned && (isCreator || prevCompleted) ? m.contentUrl : null,
    };
  });

  const assignmentSummary = resource.assignment
    ? {
        id: resource.assignment.id,
        passScore: resource.assignment.passScore,
        questionCount: (resource.assignment as any)._count.questions,
        hasPassed: isCreator || ((resource.assignment as any).attempts?.length > 0),
      }
    : null;

  return { ...resource, isOwned, isCreator, modules: modulesWithProgress, assignment: assignmentSummary };
};

export const deleteResourceService = async (resourceId: string, userId: number) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { modules: true },
  });

  if (!resource || resource.creatorId !== userId)
    throw new ServiceError("Unauthorized or not found", 403);

  for (const mod of resource.modules) {
    await deleteFromCloudinary(mod.contentUrl, "video");
  }
  if (resource.previewUrl) {
    await deleteFromCloudinary(resource.previewUrl, "image");
  }

  await prisma.resource.delete({ where: { id: resourceId } });
};

export const updateResourceService = async (resourceId: string, userId: number, data: any) => {
  const { title, description, price, thumbnail, modules } = data;

  const oldResource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { modules: true },
  });

  if (!oldResource || oldResource.creatorId !== userId)
    throw new ServiceError("Unauthorized", 403);

  const removedModules = oldResource.modules.filter(
    (oldMod) => !modules.find((newMod: any) => newMod.url === oldMod.contentUrl),
  );
  for (const mod of removedModules) {
    await deleteFromCloudinary(mod.contentUrl, "video");
  }
  if (thumbnail !== oldResource.previewUrl && oldResource.previewUrl) {
    await deleteFromCloudinary(oldResource.previewUrl, "image");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.resource.update({
      where: { id: resourceId },
      data: { title, description, price: Number(price), previewUrl: thumbnail },
    });
    await tx.module.deleteMany({ where: { resourceId } });
    await tx.module.createMany({
      data: modules.map((m: any, index: number) => ({
        title: m.title, description: m.description || null,
        contentUrl: m.url, fileType: m.fileType || "video",
        fileName: m.fileName || null, order: index,
        sectionTitle: m.sectionTitle || null, resourceId,
      })),
    });
    return updated;
  });
};

export const updateResourceBadgeService = async (resourceId: string, userId: number, badgeId: string | null) => {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource || resource.creatorId !== userId)
    throw new ServiceError("Unauthorized", 403);
  return prisma.resource.update({ where: { id: resourceId }, data: { badgeId: badgeId || null } });
};

export const getPublicResourcesService = async (params: {
  search: string; page: number; limit: number; sortBy: string; userId?: number;
}) => {
  const { search, page, limit, sortBy, userId } = params;
  const skip = (page - 1) * limit;

  const where: any = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "popular") orderBy = { views: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  if (sortBy === "price_desc") orderBy = { price: "desc" };

  const [rawResources, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where, skip, take: limit, orderBy,
      select: {
        id: true, title: true, description: true, price: true,
        previewUrl: true, views: true, creatorId: true,
        creator: { select: { full_name: true, username: true, profile_pic_url: true } },
        purchases: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { modules: true } },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  const resources = rawResources.map((r) => ({
    id: r.id, title: r.title, description: r.description,
    price: r.price, thumbnail: r.previewUrl,
    moduleCount: r._count.modules, views: r.views,
    isOwned: userId
      ? (r.purchases as any[]).length > 0 || r.creatorId === userId
      : false,
    creator: { name: r.creator.full_name, avatar: r.creator.profile_pic_url },
  }));

  return { items: resources, meta: { total, page, pages: Math.ceil(total / limit), limit } };
};

export const getCreatorStatsService = async (userId: number) => {
  const resourceAggregation = await prisma.resource.aggregate({
    where: { creatorId: userId },
    _sum: { views: true },
    _count: { id: true },
  });

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
  return {
    totalEarnings: gross * 0.8,
    grossRevenue: gross,
    totalResourceViews: resourceAggregation._sum.views || 0,
    resourceCount: resourceAggregation._count.id || 0,
  };
};

export const incrementViewCountService = async (resourceId: string) => {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { views: { increment: 1 } },
    select: { views: true },
  });
};

export const completeModuleService = async (userId: number, moduleId: string) => {
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {},
    create: { userId, moduleId },
  });

  const currentModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { resourceId: true },
  });

  if (!currentModule) return { success: true };

  const resourceId = currentModule.resourceId;
  const [totalModules, completedModules] = await Promise.all([
    prisma.module.count({ where: { resourceId } }),
    prisma.userProgress.count({ where: { userId, module: { resourceId } } }),
  ]);

  const isCourseFinished = totalModules === completedModules;
  return {
    success: true,
    isCourseFinished,
    progress: (completedModules / totalModules) * 100,
    message: isCourseFinished
      ? "All lessons complete! Take the assignment to earn your badge."
      : "Progress saved",
  };
};
