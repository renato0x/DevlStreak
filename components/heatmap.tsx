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
  if (count <= 2) return "bg-sky-400/20"
  if (count <= 5) return "bg-sky-400/40"
  if (count <= 9) return "bg-sky-400/65"
  return "bg-sky-400"
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
    const current = new Date(start)

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
    <section className="bg-[#111111] p-4 sm:p-5" aria-labelledby="activity-title">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h2 id="activity-title" className="text-base font-medium text-white">Contribution activity</h2>
          <p className="mt-1 text-xs leading-5 text-white/60">Your last 52 weeks on GitHub</p>
        </div>
        <span className="hidden text-xs text-white/60 sm:block">Less · More</span>
      </div>

      <p className="mb-3 text-xs text-white/60 sm:hidden">Swipe to view the full year.</p>
      <div className="overflow-x-auto pb-1" tabIndex={0} aria-label="52-week contribution calendar">
        <div className="relative min-w-max">
          {/* Month labels */}
          <div className="mb-2 ml-8 flex" style={{ gap: "3px" }}>
            {grid.map((_, i) => {
              const label = monthLabels.find((l) => l.col === i)
              return (
                <div key={i} className="w-3 shrink-0">
                  {label && (
                    <span className="whitespace-nowrap text-xs text-white/55">
                      {label.month}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex" style={{ gap: "3px" }}>
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: "3px" }}>
              {DAYS.map((d, i) => (
                <div key={i} className="flex h-3 items-center">
                  <span className="w-6 text-right text-xs text-white/55">{d}</span>
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
                      "h-3 w-3 cursor-default rounded-[3px] transition-colors",
                      getIntensity(day.count)
                    )}
                    aria-label={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 sm:hidden">
        <span className="text-xs text-white/55">Less</span>
        {["bg-white/[0.04]", "bg-sky-400/20", "bg-sky-400/40", "bg-sky-400/65", "bg-sky-400"].map((c) => (
          <div key={c} className={cn("w-3 h-3 rounded-sm", c)} />
        ))}
        <span className="text-xs text-white/55">More</span>
      </div>
    </section>
  )
}
