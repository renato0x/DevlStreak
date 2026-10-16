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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
          Achievements
        </span>
        <span className="text-xs text-white/40 font-mono">
          {unlockedTypes.length} / {allAchievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {allAchievements.map((item) => {
          const isUnlocked = unlockedSet.has(item.type)
          return (
            <div
              key={item.type}
              className={cn(
                "rounded-lg border p-3 flex items-start gap-3 transition-colors",
                isUnlocked
                  ? "border-violet-500/20 bg-violet-500/5 text-white"
                  : "border-white/[0.04] bg-white/[0.01] opacity-40 text-white/40 grayscale"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center text-lg shrink-0",
                  isUnlocked ? "bg-violet-500/10" : "bg-white/[0.04]"
                )}
              >
                {item.icon}
              </div>
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
