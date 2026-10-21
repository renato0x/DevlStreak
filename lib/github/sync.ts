import { dbService } from "@/lib/firebase/db"
import { fetchGitHubContributions } from "./client"
import { calculateStreak } from "@/lib/engine/streak"
import { calculateLevel, xpForDay } from "@/lib/engine/xp"
import { checkNewAchievements } from "@/lib/engine/achievements"
import { GITHUB_SYNC_INTERVAL_MS } from "./constants"

export { GITHUB_SYNC_INTERVAL_MS } from "./constants"

export function isGitHubSyncDue(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return true
  const lastSynced = Date.parse(lastSyncedAt)
  return Number.isNaN(lastSynced) || Date.now() - lastSynced >= GITHUB_SYNC_INTERVAL_MS
}

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

export async function syncUserGitHubIfDue(
  userId: string,
  githubLogin: string,
  accessToken: string,
  lastSyncedAt: string | null
) {
  if (!isGitHubSyncDue(lastSyncedAt)) {
    return { synced: false as const, reason: "fresh" as const }
  }

  const lockId = await dbService.acquireGitHubSyncLock(userId)
  if (!lockId) {
    return { synced: false as const, reason: "in_progress" as const }
  }

  try {
    const currentUser = await dbService.getUser(userId)
    if (!isGitHubSyncDue(currentUser?.lastSyncedAt ?? null)) {
      return { synced: false as const, reason: "fresh" as const }
    }

    const result = await syncUserGitHub(userId, githubLogin, accessToken)
    return { synced: true as const, ...result }
  } finally {
    await dbService.releaseGitHubSyncLock(userId, lockId)
  }
}
