import type { Contribution } from "@/lib/db/schema"

export interface StreakResult {
  current: number
  longest: number
  totalActiveDays: number
}

/**
 * Calculates current streak, longest streak, and total active days
 * from a list of contribution records.
 * A "day" is considered active when count > 0.
 */
export function calculateStreak(contributions: Contribution[]): StreakResult {
  if (!contributions.length) {
    return { current: 0, longest: 0, totalActiveDays: 0 }
  }

  // Build a Set of active date strings "YYYY-MM-DD"
  const activeDays = new Set(
    contributions.filter((c) => c.count > 0).map((c) => c.date)
  )

  const totalActiveDays = activeDays.size

  // Walk backwards from today to find current streak
  let current = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    if (activeDays.has(key)) {
      current++
    } else {
      // Allow a 1-day grace for today (day not yet active)
      if (i === 0) continue
      break
    }
  }

  // Walk all sorted active days to find longest streak
  const sorted = [...activeDays].sort()
  let longest = 0
  let run = 0
  let prev: Date | null = null

  for (const dateStr of sorted) {
    const d = new Date(dateStr)
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        run++
      } else {
        run = 1
      }
    } else {
      run = 1
    }
    if (run > longest) longest = run
    prev = d
  }

  return { current, longest, totalActiveDays }
}
