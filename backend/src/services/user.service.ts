import { prisma } from "../lib/prisma.js";
import uploadFile from "./cloudinary.service.js";
import { v2 as cloudinary } from "cloudinary";
import { ServiceError } from "../errors/service.error.js";
import type { AuthUser } from "../types/auth.js";
import formatAuthResponse from "../helper/format-auth-response.helper.js";

const forbiddenFields = ["password", "role", "createdBy", "email"];

/**
 * -------------- UPDATE USER SERVICE -----------------
 */
export const updateUserService = async (
  userId: number,
  currUserId: number,
  data: any,
  file?: Express.Multer.File,
) => {
  // 1. Fetch existing user
  const user = await findUserRaw(userId);

  // 2. Authorization Check
  if (userId !== currUserId) {
    throw { message: "Unauthorized!", statusCode: 403 };
  }

  // 3. Forbidden Fields Check
  for (let field of forbiddenFields) {
    if (field in data) {
      throw { message: `Cannot Update ${field}`, statusCode: 403 };
    }
  }

  // 4. Image Management
  let profilePicUrl = user.profile_pic_url;

  if (file && file.size > 0) {
    // Multer file upload path (legacy / direct upload)
    if (user.profile_pic_url) {
      try {
        const urlParts = user.profile_pic_url.split("/");
        const fileNameWithExtension = urlParts.pop();
        if (fileNameWithExtension) {
          const publicId = fileNameWithExtension.split(".")[0];
          await cloudinary.uploader.destroy(`profiles/${publicId}`);
        }
      } catch (err) {
        console.error("Cloudinary Delete Error (Non-fatal):", err);
      }
    }
    const uploadResult = await uploadFile(file, "profile");
    profilePicUrl = uploadResult.secure_url;
  } else if (data.profile_pic_url && typeof data.profile_pic_url === "string") {
    // JSON URL path — frontend already uploaded to Cloudinary, just store the URL
    profilePicUrl = data.profile_pic_url;
  }

  // 5. Prisma Update
  const updatedUser = await prisma.user.update({
    where: { userId: userId },
    data: {
      full_name: data.full_name ?? user.full_name,
      bio: data.bio ?? user.bio,
      profile_pic_url: profilePicUrl,
    },
  });

  return formatAuthResponse(updatedUser);
};

/**
 * -------------- GET USER BY ID -----------------
 */
export const getUserByID = async (userId: number): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { userId: userId },
  });
  if (!user) {
    throw new ServiceError("User does not exist!", 404);
  }
  return formatAuthResponse(user);
};

/**
 * ----------- GET RAW USER DETAILS FROM ID -----------
 * Internal helper for other services
 */
export const findUserRaw = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new ServiceError("User does not exist!", 404);
  return user;
};


const LANGUAGE_MAP: Record<number, string> = {
  63: "JavaScript", 74: "TypeScript", 71: "Python",
  62: "Java", 54: "C++", 50: "C",
};

export const getUserProfileService = async (targetId: number) => {
  const [
    user, acceptedSubmissions, recentSubmissions, heatmapSubmissions,
    participatedChallenges, boughtResources, globalDifficultyTotals,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { userId: targetId },
      select: {
        full_name: true, profile_pic_url: true, username: true,
        xp: true, level: true, streak: true, bio: true, created_at: true,
      },
    }),
    prisma.submission.findMany({
      where: { userId: targetId, status: "ACCEPTED" },
      distinct: ["problemId"],
      include: { problem: { select: { difficulty: true } } },
    }),
    prisma.submission.findMany({
      where: { userId: targetId, status: "ACCEPTED" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { problem: { select: { title: true, problemId: true } } },
    }),
    prisma.submission.findMany({
      where: {
        userId: targetId, status: "ACCEPTED",
        createdAt: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
      },
      select: { createdAt: true },
    }),
    prisma.submission.findMany({
      where: { userId: targetId, challengeId: { not: null } },
      distinct: ["challengeId"],
      select: { challengeId: true, createdAt: true },
    }),
    prisma.purchase.findMany({
      where: { userId: targetId },
      include: {
        resource: {
          select: {
            id: true, title: true, type: true, previewUrl: true,
            _count: { select: { modules: true } },
          },
        },
      },
    }),
    prisma.problem.groupBy({ by: ["difficulty"], _count: { problemId: true } }),
  ]);

  if (!user) throw new ServiceError("User not found", 404);

  const challengeIds = participatedChallenges.map((c) => c.challengeId as number);
  const [challengeDetails, earnedBadges] = await Promise.all([
    prisma.challenge.findMany({
      where: { challengeId: { in: challengeIds } },
      select: { title: true, challengeId: true, difficulty: true, slug: true },
    }),
    prisma.userBadge.findMany({
      where: { userId: targetId },
      include: { badge: { select: { id: true, name: true, description: true, iconUrl: true } } },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const resourceIds = boughtResources.map((p) => p.resource.id);
  const completedByResource: Record<string, number> = {};
  if (resourceIds.length > 0) {
    const progressRows = await prisma.userProgress.findMany({
      where: { userId: targetId, module: { resourceId: { in: resourceIds } } },
      select: { module: { select: { resourceId: true } } },
    });
    for (const row of progressRows) {
      const rid = row.module.resourceId;
      completedByResource[rid] = (completedByResource[rid] || 0) + 1;
    }
  }

  const getGlobalTotal = (diff: string) =>
    globalDifficultyTotals.find((g) => g.difficulty.toUpperCase() === diff.toUpperCase())
      ?._count.problemId || 0;

  const stats = {
    easy: {
      solved: acceptedSubmissions.filter((s) => s.problem.difficulty.toUpperCase() === "EASY").length,
      total: getGlobalTotal("EASY"),
    },
    medium: {
      solved: acceptedSubmissions.filter((s) => s.problem.difficulty.toUpperCase() === "MEDIUM").length,
      total: getGlobalTotal("MEDIUM"),
    },
    hard: {
      solved: acceptedSubmissions.filter((s) => s.problem.difficulty.toUpperCase() === "HARD").length,
      total: getGlobalTotal("HARD"),
    },
  };

  const languageCounts: Record<number, number> = {};
  acceptedSubmissions.forEach((s) => {
    languageCounts[s.languageId] = (languageCounts[s.languageId] || 0) + 1;
  });
  const languageStats = Object.keys(languageCounts)
    .map((id) => ({ name: LANGUAGE_MAP[Number(id)] || `Lang ${id}`, count: languageCounts[Number(id)] }))
    .sort((a, b) => b.count - a.count);

  const heatmapData = heatmapSubmissions.reduce((acc: any[], curr) => {
    const date = curr.createdAt.toISOString().split("T")[0];
    const existing = acc.find((item) => item.date === date);
    if (existing) existing.count += 1;
    else acc.push({ date, count: 1 });
    return acc;
  }, []);

  return {
    user: {
      name: user.full_name, username: user.username,
      profile_pic_url: user.profile_pic_url, xp: user.xp,
      level: user.level, streak: user.streak, bio: user.bio, joined: user.created_at,
    },
    stats, languageStats, heatmapData,
    recentSubmissions: recentSubmissions.map((s) => ({
      id: s.id, title: s.problem.title, problemId: s.problem.problemId, createdAt: s.createdAt,
    })),
    challenges: challengeDetails.map((c) => ({
      id: c.challengeId, title: c.title, difficulty: c.difficulty, slug: c.slug,
    })),
    resources: boughtResources.map((p) => ({
      id: p.resource.id, title: p.resource.title, type: p.resource.type,
      thumbnail: p.resource.previewUrl, totalModules: p.resource._count.modules,
      completedModules: completedByResource[p.resource.id] || 0,
    })),
    badges: earnedBadges.map((ub) => ({
      id: ub.badge.id, name: ub.badge.name, description: ub.badge.description,
      iconUrl: ub.badge.iconUrl, earnedAt: ub.earnedAt,
    })),
  };
};
