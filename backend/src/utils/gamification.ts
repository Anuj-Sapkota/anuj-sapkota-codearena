import { prisma } from '../lib/prisma.js'

export const handleUserActivity = async (userId: number, problemId: number, difficulty: string) => {
  // 1. Define XP based on difficulty
  const xpValues: Record<string, number> = {
    "EASY": 10,
    "MEDIUM": 30,
    "HARD": 50,
  };

  const xpGained = xpValues[difficulty.toUpperCase()] || 10;

  // 2. Check if user already solved this problem (to prevent XP farming)
  const alreadySolved = await prisma.submission.findFirst({
    where: {
      userId,
      problemId,
      status: "Accepted",
      // We look for any PREVIOUS accepted submissions
      createdAt: { lt: new Date() } 
    }
  });

  if (alreadySolved) return { message: "Already earned XP for this." };

  // 3. Update User (XP, Level, and Streak)
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return;

  let newStreak = user.streak;
  const now = new Date();
  const lastActivity = user.lastActivityDate;

  if (lastActivity) {
    const hoursSinceLast = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLast <= 48 && hoursSinceLast >= 24) {
      newStreak += 1; // Kept it going!
    } else if (hoursSinceLast > 48) {
      newStreak = 1; // Streak broken, reset to 1
    }
  } else {
    newStreak = 1; // First activity ever
  }

  // 4. Execute all updates in a Transaction
  return await prisma.$transaction([
    // Update User Stats
    prisma.user.update({
      where: { userId },
      data: {
        xp: { increment: xpGained },
        total_points: { increment: xpGained },
        streak: newStreak,
        lastActivityDate: now,
        // Basic leveling: Level up every 500 XP
        level: Math.floor((user.xp + xpGained) / 500) + 1
      }
    }),
    // Create Heatmap Activity
    prisma.activity.create({
      data: {
        userId,
        type: `${difficulty.toUpperCase()}_SOLVED`,
        xpGained: xpGained
      }
    })
  ]);
};