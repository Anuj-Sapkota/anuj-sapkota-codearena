/**
 * Levelling system
 * ─────────────────────────────────────────────────────────────────────────────
 * Level thresholds (cumulative XP required to reach that level):
 *
 *  Lv 1  →    0 XP  (starting level)
 *  Lv 2  →  100 XP
 *  Lv 3  →  250 XP
 *  Lv 4  →  450 XP
 *  Lv 5  →  700 XP
 *  Lv 6  → 1000 XP
 *  Lv 7  → 1400 XP
 *  Lv 8  → 1900 XP
 *  Lv 9  → 2500 XP
 *  Lv 10 → 3200 XP
 *  Lv 11+ → 3200 + (level-10) * 800 XP  (linear after 10)
 *
 * This gives a satisfying early progression that slows down at higher levels.
 */

const LEVEL_THRESHOLDS = [
  0,    // Lv 1
  100,  // Lv 2
  250,  // Lv 3
  450,  // Lv 4
  700,  // Lv 5
  1000, // Lv 6
  1400, // Lv 7
  1900, // Lv 8
  2500, // Lv 9
  3200, // Lv 10
];

/**
 * Returns the level for a given total XP amount.
 * Always returns at least 1.
 */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  // Linear extension beyond level 10
  if (totalXp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extra = totalXp - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    level = LEVEL_THRESHOLDS.length + Math.floor(extra / 800);
  }
  return Math.max(1, level);
}

/**
 * Returns XP needed to reach the next level from current total XP.
 */
export function xpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const nextLevel = currentLevel + 1;

  if (nextLevel - 1 < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[nextLevel - 1] - totalXp;
  }
  // Linear zone
  const base = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const levelsAbove10 = currentLevel - LEVEL_THRESHOLDS.length;
  const nextThreshold = base + (levelsAbove10 + 1) * 800;
  return nextThreshold - totalXp;
}

/**
 * Returns progress percentage within the current level (0–100).
 */
export function levelProgress(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  const idx = currentLevel - 1;

  let levelStart: number;
  let levelEnd: number;

  if (idx < LEVEL_THRESHOLDS.length - 1) {
    levelStart = LEVEL_THRESHOLDS[idx];
    levelEnd = LEVEL_THRESHOLDS[idx + 1];
  } else {
    // Linear zone
    const base = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const levelsAbove10 = currentLevel - LEVEL_THRESHOLDS.length;
    levelStart = base + levelsAbove10 * 800;
    levelEnd = levelStart + 800;
  }

  const progress = ((totalXp - levelStart) / (levelEnd - levelStart)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}
