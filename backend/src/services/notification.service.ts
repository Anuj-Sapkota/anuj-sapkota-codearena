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
  // Deduplicate: don't create the same notification twice within 60 seconds
  const recent = await prisma.notification.findFirst({
    where: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  });
  if (recent) return recent;
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

// ─── Payment notifications ────────────────────────────────────────────────────

export const notifyCoursePurchased = (
  studentId: number,
  creatorId: number,
  resourceTitle: string,
  amount: number,
  resourceId: string,
) => {
  const npr = (v: number) => `NPR ${v.toLocaleString()}`;
  return Promise.all([
    // Student: enrollment confirmed
    createNotification({
      userId: studentId,
      type: "SYSTEM",
      title: "Enrollment Confirmed 🎓",
      message: `You've successfully enrolled in "${resourceTitle}". Start learning now!`,
      link: `/resource/${resourceId}`,
    }),
    // Creator: new sale
    createNotification({
      userId: creatorId,
      type: "SYSTEM",
      title: "New Course Sale 💰",
      message: `Someone purchased "${resourceTitle}". You earned ${npr(amount * 0.8)} (80% of ${npr(amount)}).`,
      link: "/creator/dashboard",
    }),
  ]);
};

// ─── Role change notifications ────────────────────────────────────────────────

export const notifyRoleChanged = (userId: number, newRole: string, oldRole: string) => {
  const messages: Record<string, { title: string; message: string }> = {
    ADMIN: {
      title: "You've been promoted to Admin 🛡️",
      message: "You now have full administrative access to CodeArena.",
    },
    CREATOR: {
      title: "You've been promoted to Creator 🎨",
      message: "You can now publish courses and resources on CodeArena.",
    },
    USER: {
      title: "Role Updated",
      message: `Your role has been changed from ${oldRole} to USER by an administrator.`,
    },
  };

  const content = messages[newRole] ?? {
    title: "Role Updated",
    message: `Your account role has been updated to ${newRole}.`,
  };

  return createNotification({
    userId,
    type: "SYSTEM",
    title: content.title,
    message: content.message,
    link: "/settings",
  });
};
