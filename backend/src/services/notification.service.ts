import { prisma } from "../lib/prisma.js";
import type { NotificationType } from "../../generated/prisma/client.js";

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (data: CreateNotificationInput) => {
  return prisma.notification.create({ data });
};

export const getNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const markAsRead = async (userId: number, notificationId?: string) => {
  if (notificationId) {
    // Mark single notification
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
  // Mark all
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const getUnreadCount = async (userId: number) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const deleteNotification = async (userId: number, id: string) => {
  return prisma.notification.deleteMany({ where: { id, userId } });
};

// ─── Typed helpers called from other services ─────────────────────────────────

export const notifyCreatorApproved = (userId: number) =>
  createNotification({
    userId,
    type: "CREATOR_APPROVED",
    title: "You're now a Creator! 🎉",
    message: "Your creator application has been approved. You can now publish courses and resources on CodeArena.",
    link: "/creator/dashboard",
  });

export const notifyCreatorRejected = (userId: number, reason?: string) =>
  createNotification({
    userId,
    type: "CREATOR_REJECTED",
    title: "Creator Application Update",
    message: reason
      ? `Your application was not approved: ${reason}`
      : "Your creator application was not approved at this time. You may reapply after addressing the feedback.",
    link: "/creator/apply",
  });

export const notifyBadgeEarned = (userId: number, badgeName: string, resourceTitle: string) =>
  createNotification({
    userId,
    type: "BADGE_EARNED",
    title: `Badge Earned: ${badgeName} 🏅`,
    message: `You completed "${resourceTitle}" and earned the ${badgeName} badge.`,
    link: `/u/${userId}`,
  });

export const notifyChallengeCompleted = (userId: number, challengeTitle: string, bonusXp: number) =>
  createNotification({
    userId,
    type: "CHALLENGE_COMPLETED",
    title: `Challenge Completed! ⚡`,
    message: `You solved all problems in "${challengeTitle}" and earned ${bonusXp} bonus XP.`,
    link: "/challenges",
  });

export const notifyFirstSolve = (userId: number, problemTitle: string, xpGained: number) =>
  createNotification({
    userId,
    type: "FIRST_SOLVE",
    title: `Problem Solved: ${problemTitle} ✅`,
    message: `First solve! You earned ${xpGained} XP.`,
    link: "/problems",
  });

export const notifyLevelUp = (userId: number, newLevel: number) =>
  createNotification({
    userId,
    type: "LEVEL_UP",
    title: `Level Up! You're now Level ${newLevel} 🚀`,
    message: `Keep solving problems to reach the next level.`,
    link: "/explore",
  });
