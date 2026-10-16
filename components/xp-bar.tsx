"use client"

import { cn } from "@/lib/utils"
import { levelTitle } from "@/lib/engine/xp"

interface XpBarProps {
  level: number
  xp: number
  xpForNext: number
  progress: number
}

export function XpBar({ level, xp, xpForNext, progress }: XpBarProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
          Level
        </span>
        <span className="text-xs text-white/30 font-mono">{levelTitle(level)}</span>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold tracking-tight text-white">
          Lv. {level}
        </span>
        <span className="text-sm text-white/30 mb-1 font-mono">
          {xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
