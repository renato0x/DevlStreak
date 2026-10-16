export interface LevelResult {
  level: number
  xp: number
  xpForNext: number
  progress: number // 0–100 percent
}

/**
 * XP awarded per contribution day:
 * base 10 XP + 5 XP per streak day (capped at 50 bonus)
 */
export function xpForDay(streakDay: number): number {
  const bonus = Math.min(streakDay * 5, 50)
  return 10 + bonus
}

/**
 * XP required to reach a given level.
 * Formula: level * 1000 (cumulative)
 * Lv1→Lv2: 1000 XP, Lv2→Lv3: 2000 XP, etc.
 */
export function xpRequiredForLevel(level: number): number {
  return level * 1000
}

/**
 * Returns level info from total XP accumulated.
 */
export function calculateLevel(totalXp: number): LevelResult {
  let level = 1
  let remaining = totalXp

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level)
    level++
  }

  const xpForNext = xpRequiredForLevel(level)
  const progress = Math.floor((remaining / xpForNext) * 100)

  return {
    level,
    xp: remaining,
    xpForNext,
    progress,
  }
}

/**
 * Formats a level number into a display label.
 * E.g. level 1 = "Rookie", level 10 = "Senior", etc.
 */
export function levelTitle(level: number): string {
  if (level < 3) return "Rookie"
  if (level < 6) return "Junior"
  if (level < 10) return "Mid-level"
  if (level < 15) return "Senior"
  if (level < 20) return "Staff"
  return "Principal"
}
