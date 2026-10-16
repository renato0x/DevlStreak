"use client"

import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent?: boolean
}

export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col gap-3 transition-colors hover:border-white/[0.1]",
        accent && "border-violet-500/30 bg-violet-500/5"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-white/30">{icon}</span>
      </div>
      <div>
        <p
          className={cn(
            "text-3xl font-bold tracking-tight",
            accent ? "text-violet-400" : "text-white"
          )}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
