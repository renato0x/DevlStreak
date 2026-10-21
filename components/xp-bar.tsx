"use client"

import { levelTitle } from "@/lib/engine/xp"

interface XpBarProps {
  level: number
  xp: number
  xpForNext: number
  progress: number
}

export function XpBar({ level, xp, xpForNext, progress }: XpBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#111111] p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white">Level progression</span>
        <span className="text-xs text-white/45">{levelTitle(level)}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-medium tracking-tight text-white sm:text-[28px]">
          Lv. {level}
        </span>
        <span className="text-sm text-white/45 tabular-nums">
          {xp.toLocaleString()} / {xpForNext.toLocaleString()} XP
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white/[0.1]"
        role="progressbar"
        aria-label={`Level ${level} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-sky-400 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
