"use client"

import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  accent?: boolean
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[132px] flex-col justify-between bg-[#111111] p-4 transition-colors hover:bg-[#171717] sm:p-5",
        accent && "bg-[#15131a]"
      )}
    >
      <span className="text-xs font-medium text-white/50">{label}</span>
      <div>
        <p
          className={cn(
            "text-2xl font-medium tracking-tight tabular-nums sm:text-[28px]",
            accent ? "text-sky-300" : "text-white"
          )}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
      </div>
    </div>
  )
}
