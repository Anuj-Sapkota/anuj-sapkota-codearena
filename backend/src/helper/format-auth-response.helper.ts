import type { AuthUser } from "../types/auth.js";

const formatAuthResponse = (user: any): { user: AuthUser["user"] } => {
  // Recalculate streak: reset if last activity was more than 1 day ago
  let streak = user.streak ?? 0;
  if (user.lastActivityDate && streak > 0) {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMidnight = new Date(
      user.lastActivityDate.getFullYear(),
      user.lastActivityDate.getMonth(),
      user.lastActivityDate.getDate(),
    );
    const daysDiff = Math.round(
      (todayMidnight.getTime() - lastMidnight.getTime()) / 86_400_000,
    );
    if (daysDiff > 1) streak = 0;
  }

  return {
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      bio: user.bio,
      profile_pic_url: user.profile_pic_url ?? null,
      email: user.email,
      role: user.role,
      has_password: user.has_password,
      total_points: user.total_points,
      google_id: user.google_id ?? null,
      github_id: user.github_id ?? null,
      xp: user.xp ?? 0,
      level: user.level ?? 1,
      streak,
      creatorStatus: user.creatorStatus,
      creatorProfile: user.creatorProfile
        ? {
            rejectionReason: user.creatorProfile.rejectionReason ?? null,
            portfolioUrl: user.creatorProfile.portfolioUrl ?? null,
            githubUrl: user.creatorProfile.githubUrl ?? null,
          }
        : null,
    },
  };
};

export default formatAuthResponse;
