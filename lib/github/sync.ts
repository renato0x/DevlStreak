import { db } from "@/lib/db"
import { users, contributions, achievements } from "@/lib/db/schema"
import { fetchGitHubContributions } from "./client"
import { calculateStreak } from "@/lib/engine/streak"
import { calculateLevel, xpForDay } from "@/lib/engine/xp"
import { checkNewAchievements } from "@/lib/engine/achievements"
import { eq, and } from "drizzle-orm"

export async function syncUserGitHub(userId: string, githubLogin: string, accessToken: string) {
  // 1. Fetch contributions from GitHub (last 12 months)
  const days = await fetchGitHubContributions(githubLogin, accessToken)

  // 2. Upsert each day into the contributions table
  for (const day of days) {
    const existing = await db.query.contributions.findFirst({
      where: and(eq(contributions.userId, userId), eq(contributions.date, day.date)),
    })

    if (existing) {
      await db
        .update(contributions)
        .set({ count: day.contributionCount })
        .where(and(eq(contributions.userId, userId), eq(contributions.date, day.date)))
    } else {
      await db.insert(contributions).values({
        userId,
        date: day.date,
        count: day.contributionCount,
      })
    }
  }

  // 3. Load all contributions to compute stats
  const allContributions = await db.query.contributions.findMany({
    where: eq(contributions.userId, userId),
  })

  // 4. Compute streak
  const streakResult = calculateStreak(allContributions)

  // 5. Compute XP — sum XP for each active day weighted by run length
  let totalXp = 0
  const activeSorted = allContributions
    .filter((c) => c.count > 0)
    .map((c) => c.date)
    .sort()

  let run = 0
  let prevDate: Date | null = null
  for (const dateStr of activeSorted) {
    const d = new Date(dateStr)
    if (prevDate) {
      const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    totalXp += xpForDay(run)
    prevDate = d
  }

  const levelResult = calculateLevel(totalXp)

  // 6. Check for new achievements
  const existingAchievements = await db.query.achievements.findMany({
    where: eq(achievements.userId, userId),
  })
  const existingTypes = existingAchievements.map((a) => a.type) as any[]

  const newAchievements = checkNewAchievements({
    streak: streakResult.current,
    level: levelResult.level,
    totalActiveDays: streakResult.totalActiveDays,
    existing: existingTypes,
  })

  // 7. Insert new achievements
  if (newAchievements.length > 0) {
    await db.insert(achievements).values(
      newAchievements.map((type) => ({ userId, type }))
    )
  }

  // 8. Update user stats
  await db
    .update(users)
    .set({
      xp: totalXp,
      level: levelResult.level,
      currentStreak: streakResult.current,
      longestStreak: streakResult.longest,
      totalActiveDays: streakResult.totalActiveDays,
      lastSyncedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return {
    streak: streakResult,
    level: levelResult,
    newAchievements,
  }
}
