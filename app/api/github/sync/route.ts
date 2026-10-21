import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbService } from "@/lib/firebase/db"
import { syncUserGitHubIfDue } from "@/lib/github/sync"
import { GitHubApiError } from "@/lib/github/client"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const user = await dbService.getUser(userId)

  const credential =
    (await dbService.getGitHubCredential(userId)) ??
    (await dbService.migrateLegacyGitHubCredential(userId))

  if (!credential) {
    return NextResponse.json(
      { error: "Reconnect GitHub to resume automatic syncing.", code: "reauthorize" },
      { status: 401 }
    )
  }

  try {
    const result = await syncUserGitHubIfDue(
      userId,
      credential.githubLogin,
      credential.accessToken,
      user?.lastSyncedAt ?? null
    )

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 401) {
      return NextResponse.json(
        { error: "GitHub authorization expired. Reconnect GitHub to continue.", code: "reauthorize" },
        { status: 401 }
      )
    }

    console.error("GitHub sync failed", error)
    return NextResponse.json(
      { error: "GitHub sync failed. Please try again later." },
      { status: 502 }
    )
  }
}
