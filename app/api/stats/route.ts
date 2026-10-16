import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { contributions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  })

  const contribs = await db.query.contributions.findMany({
    where: eq(contributions.userId, userId),
    orderBy: (c, { asc }) => [asc(c.date)],
  })

  const userAchievements = await db.query.achievements.findMany({
    where: (a, { eq }) => eq(a.userId, userId),
  })

  return NextResponse.json({
    user,
    contributions: contribs,
    achievements: userAchievements,
  })
}
