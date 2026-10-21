export type AchievementType =
  | "streak_7"
  | "streak_30"
  | "streak_100"
  | "level_5"
  | "level_10"
  | "days_50"
  | "days_100"
  | "days_365"
  | "first_commit"

export type AchievementIcon = "spark" | "flame" | "calendar" | "rocket" | "trophy" | "medal"

export interface AchievementDef {
  type: AchievementType
  label: string
  description: string
  icon: AchievementIcon
}

export const ACHIEVEMENT_DEFS: Record<AchievementType, AchievementDef> = {
  first_commit: {
    type: "first_commit",
    label: "First Blood",
    description: "Made your first contribution tracked by DevlStreak.",
    icon: "spark",
  },
  streak_7: {
    type: "streak_7",
    label: "Week Warrior",
    description: "Maintained a 7-day streak.",
    icon: "flame",
  },
  streak_30: {
    type: "streak_30",
    label: "Monthly Grinder",
    description: "Maintained a 30-day streak.",
    icon: "flame",
  },
  streak_100: {
    type: "streak_100",
    label: "Century Coder",
    description: "Maintained a 100-day streak.",
    icon: "medal",
  },
  level_5: {
    type: "level_5",
    label: "Mid-Journey",
    description: "Reached level 5.",
    icon: "rocket",
  },
  level_10: {
    type: "level_10",
    label: "Double Digits",
    description: "Reached level 10.",
    icon: "trophy",
  },
  days_50: {
    type: "days_50",
    label: "Half Century",
    description: "50 active development days.",
    icon: "calendar",
  },
  days_100: {
    type: "days_100",
    label: "Centurion",
    description: "100 active development days.",
    icon: "medal",
  },
  days_365: {
    type: "days_365",
    label: "Year-Round Dev",
    description: "365 active development days.",
    icon: "calendar",
  },
}

export interface AchievementCheck {
  streak: number
  level: number
  totalActiveDays: number
  existing: AchievementType[]
}

/**
 * Returns a list of newly unlocked achievement types
 * based on current stats vs. already unlocked ones.
 */
export function checkNewAchievements(data: AchievementCheck): AchievementType[] {
  const unlocked: AchievementType[] = []
  const has = (t: AchievementType) => data.existing.includes(t)

  if (data.totalActiveDays >= 1 && !has("first_commit")) unlocked.push("first_commit")
  if (data.streak >= 7 && !has("streak_7")) unlocked.push("streak_7")
  if (data.streak >= 30 && !has("streak_30")) unlocked.push("streak_30")
  if (data.streak >= 100 && !has("streak_100")) unlocked.push("streak_100")
  if (data.level >= 5 && !has("level_5")) unlocked.push("level_5")
  if (data.level >= 10 && !has("level_10")) unlocked.push("level_10")
  if (data.totalActiveDays >= 50 && !has("days_50")) unlocked.push("days_50")
  if (data.totalActiveDays >= 100 && !has("days_100")) unlocked.push("days_100")
  if (data.totalActiveDays >= 365 && !has("days_365")) unlocked.push("days_365")

  return unlocked
}
