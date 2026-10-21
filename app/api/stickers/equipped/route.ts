import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbService } from "@/lib/firebase/db"
import { isStickerId, STICKER_DEFS, type StickerId } from "@/lib/engine/stickers"

export const dynamic = "force-dynamic"

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin")
  return origin !== null && origin === new URL(request.url).origin
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (request.headers.get("content-type")?.split(";")[0] !== "application/json" || !isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid sticker request." }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => null)
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    !("stickerId" in body)
  ) {
    return NextResponse.json({ error: "Invalid sticker payload." }, { status: 400 })
  }

  const stickerId = body.stickerId
  if (stickerId !== null && !isStickerId(stickerId)) {
    return NextResponse.json({ error: "Unknown sticker." }, { status: 400 })
  }

  if (stickerId !== null) {
    const sticker = STICKER_DEFS.find((candidate) => candidate.id === stickerId)
    const achievements = await dbService.getAchievements(session.user.id)
    if (!sticker || !achievements.some((achievement) => achievement.type === sticker.achievementType)) {
      return NextResponse.json({ error: "That sticker is still locked." }, { status: 403 })
    }
  }

  await dbService.setFeaturedSticker(session.user.id, stickerId as StickerId | null)
  return NextResponse.json({ featuredStickerId: stickerId })
}
