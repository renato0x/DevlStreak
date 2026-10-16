import { dbService } from "@/lib/firebase/db"
import { fetchGitHubContributions } from "./client"
import { calculateStreak } from "@/lib/engine/streak"
import { calculateLevel, xpForDay } from "@/lib/engine/xp"
import { checkNewAchievements } from "@/lib/engine/achievements"

export async function syncUserGitHub(
  userId: string,
  githubLogin: string,
  accessToken: string
) {
  // 1. Fetch contributions from GitHub (last 12 months)
  const days = await fetchGitHubContributions(githubLogin, accessToken)

  // 2. Format and batch save contributions in Firestore
  const contributionRecords = days.map((d) => ({
    date: d.date,
    count: d.contributionCount,
  }))

  await dbService.saveContributions(userId, contributionRecords)

  // 3. Load all contributions from Firestore to compute stats
  const allContributions = await dbService.getContributions(userId)

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
  const existingAchievements = await dbService.getAchievements(userId)
  const existingTypes = existingAchievements.map((a) => a.type)

  const newAchievements = checkNewAchievements({
    streak: streakResult.current,
    level: levelResult.level,
    totalActiveDays: streakResult.totalActiveDays,
    existing: existingTypes,
  })

  // 7. Save newly unlocked achievements in Firestore
  if (newAchievements.length > 0) {
    await dbService.addAchievements(userId, newAchievements)
  }

  // 8. Update user stats in Firestore
  await dbService.saveUser(userId, {
    xp: totalXp,
    level: levelResult.level,
    currentStreak: streakResult.current,
    longestStreak: streakResult.longest,
    totalActiveDays: streakResult.totalActiveDays,
    lastSyncedAt: new Date().toISOString(),
  })

  return {
    streak: streakResult,
    level: levelResult,
    newAchievements,
  }
}
