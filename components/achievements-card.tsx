"use client"

import { ACHIEVEMENT_DEFS, AchievementType } from "@/lib/engine/achievements"
import { cn } from "@/lib/utils"

interface AchievementsCardProps {
  unlockedTypes: AchievementType[]
}

export function AchievementsCard({ unlockedTypes }: AchievementsCardProps) {
  const allAchievements = Object.values(ACHIEVEMENT_DEFS)
  const unlockedSet = new Set(unlockedTypes)

  return (
    <div className="rounded-lg bg-[#111111] p-5">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-white">Achievements</h2>
          <p className="mt-1 text-xs text-white/40">Milestones earned as your practice compounds</p>
        </div>
        <span className="text-xs text-white/45 tabular-nums">
          {unlockedTypes.length} / {allAchievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md bg-white/[0.1] sm:grid-cols-2 md:grid-cols-3">
        {allAchievements.map((item) => {
          const isUnlocked = unlockedSet.has(item.type)
          return (
            <div
              key={item.type}
              className={cn(
                "flex min-h-[82px] items-start gap-3 bg-[#111111] p-3 transition-colors",
                isUnlocked
                  ? "text-white hover:bg-[#171717]"
                  : "text-white/45 opacity-70 grayscale"
              )}
            >
              <span className="mt-0.5 w-5 shrink-0 text-center text-base leading-none" aria-hidden="true">
                {item.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate leading-tight">
                  {item.label}
                </span>
                <span className="text-xs text-white/40 line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
