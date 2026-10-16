"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ContributionDay {
  date: string
  count: number
}

interface HeatmapProps {
  contributions: ContributionDay[]
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-white/[0.04]"
  if (count <= 2) return "bg-violet-500/20"
  if (count <= 5) return "bg-violet-500/40"
  if (count <= 9) return "bg-violet-500/65"
  return "bg-violet-500"
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""]

export function Heatmap({ contributions }: HeatmapProps) {
  const grid = useMemo(() => {
    const map = new Map(contributions.map((c) => [c.date, c.count]))

    // Build a 52-week grid ending today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start on the Sunday 52 weeks ago
    const start = new Date(today)
    start.setDate(start.getDate() - 52 * 7 + 1)

    const weeks: { date: string; count: number }[][] = []
    let current = new Date(start)

    while (current <= today) {
      const week: { date: string; count: number }[] = []
      for (let d = 0; d < 7; d++) {
        const key = current.toISOString().split("T")[0]
        week.push({ date: key, count: map.get(key) ?? 0 })
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }, [contributions])

  // Derive month labels from first day of each week
  const monthLabels = useMemo(() => {
    const labels: { month: string; col: number }[] = []
    let lastMonth = -1
    grid.forEach((week, i) => {
      const d = new Date(week[0].date)
      if (d.getMonth() !== lastMonth) {
        labels.push({ month: MONTHS[d.getMonth()], col: i })
        lastMonth = d.getMonth()
      }
    })
    return labels
  }, [grid])

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">
        Contribution Activity
      </p>

      <div className="overflow-x-auto">
        <div className="relative">
          {/* Month labels */}
          <div className="flex mb-2 ml-8" style={{ gap: "3px" }}>
            {grid.map((_, i) => {
              const label = monthLabels.find((l) => l.col === i)
              return (
                <div key={i} className="w-3 shrink-0">
                  {label && (
                    <span className="text-[10px] text-white/25 whitespace-nowrap">
                      {label.month}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: "3px" }}>
              {DAYS.map((d, i) => (
                <div key={i} className="h-3 flex items-center">
                  <span className="text-[10px] text-white/25 w-6 text-right">{d}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: "3px" }}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} contributions`}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors cursor-default",
                      getIntensity(day.count)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-white/25">Less</span>
        {["bg-white/[0.04]","bg-violet-500/20","bg-violet-500/40","bg-violet-500/65","bg-violet-500"].map((c) => (
          <div key={c} className={cn("w-3 h-3 rounded-sm", c)} />
        ))}
        <span className="text-[10px] text-white/25">More</span>
      </div>
    </div>
  )
}
