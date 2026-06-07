/**
 * Frontend mirror of backend/src/utils/gamification.ts
 * Keep in sync with the backend level thresholds.
 */

const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
];

export function calculateLevel(totalXp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  if (totalXp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extra = totalXp - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    level = LEVEL_THRESHOLDS.length + Math.floor(extra / 800);
  }
  return Math.max(1, level);
}

export function xpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const nextIdx = currentLevel; // LEVEL_THRESHOLDS[nextIdx] = threshold for level currentLevel+1
  if (nextIdx < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[nextIdx] - totalXp;
  }
  const base = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const levelsAbove10 = currentLevel - LEVEL_THRESHOLDS.length;
  return base + (levelsAbove10 + 1) * 800 - totalXp;
}

export function levelProgress(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const idx = currentLevel - 1;
  let levelStart: number, levelEnd: number;
  if (idx < LEVEL_THRESHOLDS.length - 1) {
    levelStart = LEVEL_THRESHOLDS[idx];
    levelEnd = LEVEL_THRESHOLDS[idx + 1];
  } else {
    const base = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const levelsAbove10 = currentLevel - LEVEL_THRESHOLDS.length;
    levelStart = base + levelsAbove10 * 800;
    levelEnd = levelStart + 800;
  }
  return Math.min(100, Math.max(0, Math.round(((totalXp - levelStart) / (levelEnd - levelStart)) * 100)));
}
