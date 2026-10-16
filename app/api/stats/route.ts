import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbService } from "@/lib/firebase/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const user = await dbService.getUser(userId)
  const contribs = await dbService.getContributions(userId)
  const userAchievements = await dbService.getAchievements(userId)

  return NextResponse.json({
    user,
    contributions: contribs,
    achievements: userAchievements,
  })
}
