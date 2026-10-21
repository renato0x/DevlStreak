import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbService } from "@/lib/firebase/db"
import { getStickerCollection } from "@/lib/engine/stickers"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const user = await dbService.getUser(userId)
  const contribs = await dbService.getContributions(userId)
  const userAchievements = await dbService.getAchievements(userId)
  const stickers = getStickerCollection(userAchievements, user?.featuredStickerId ?? null)

  return NextResponse.json({
    user: user && {
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalActiveDays: user.totalActiveDays,
      lastSyncedAt: user.lastSyncedAt,
      githubLogin: user.githubLogin,
      image: user.image,
      featuredStickerId: user.featuredStickerId,
    },
    contributions: contribs,
    achievements: userAchievements,
    stickers,
  })
}
