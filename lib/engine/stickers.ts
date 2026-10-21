import type { AchievementType } from "./achievements"

export type StickerId =
  | "first-spark"
  | "week-builder"
  | "month-maker"
  | "century-loop"
  | "level-five"
  | "level-ten"
  | "fifty-days"
  | "hundred-days"
  | "year-round"

export type StickerIcon =
  | "spark"
  | "flame"
  | "calendar"
  | "orbit"
  | "rocket"
  | "trophy"

export interface StickerDefinition {
  id: StickerId
  achievementType: AchievementType
  label: string
  description: string
  icon: StickerIcon
}

export interface StickerState extends StickerDefinition {
  unlocked: boolean
  unlockedAt: string | null
  featured: boolean
}

export const STICKER_DEFS: readonly StickerDefinition[] = [
  { id: "first-spark", achievementType: "first_commit", label: "First spark", description: "Make your first tracked contribution.", icon: "spark" },
  { id: "week-builder", achievementType: "streak_7", label: "Week builder", description: "Keep a seven-day streak.", icon: "flame" },
  { id: "month-maker", achievementType: "streak_30", label: "Month maker", description: "Keep a 30-day streak.", icon: "calendar" },
  { id: "century-loop", achievementType: "streak_100", label: "Century loop", description: "Keep a 100-day streak.", icon: "orbit" },
  { id: "level-five", achievementType: "level_5", label: "Level five", description: "Reach level five.", icon: "rocket" },
  { id: "level-ten", achievementType: "level_10", label: "Level ten", description: "Reach level ten.", icon: "trophy" },
  { id: "fifty-days", achievementType: "days_50", label: "Fifty days", description: "Log 50 active development days.", icon: "calendar" },
  { id: "hundred-days", achievementType: "days_100", label: "Hundred days", description: "Log 100 active development days.", icon: "orbit" },
  { id: "year-round", achievementType: "days_365", label: "Year round", description: "Log 365 active development days.", icon: "trophy" },
]

export function isStickerId(value: unknown): value is StickerId {
  return typeof value === "string" && STICKER_DEFS.some((sticker) => sticker.id === value)
}

export function getStickerDefinition(stickerId: StickerId | null | undefined) {
  return STICKER_DEFS.find((sticker) => sticker.id === stickerId) ?? null
}

export function getStickerCollection(
  achievements: readonly { type: AchievementType; unlockedAt: string }[],
  featuredStickerId: StickerId | null
): StickerState[] {
  const unlocks = new Map(achievements.map((achievement) => [achievement.type, achievement.unlockedAt]))

  return STICKER_DEFS.map((sticker) => {
    const unlockedAt = unlocks.get(sticker.achievementType) ?? null
    return {
      ...sticker,
      unlocked: unlockedAt !== null,
      unlockedAt,
      featured: sticker.id === featuredStickerId,
    }
  })
}
