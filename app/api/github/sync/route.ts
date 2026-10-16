import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { dbService } from "@/lib/firebase/db"
import { syncUserGitHub } from "@/lib/github/sync"
import { fetchGitHubUser } from "@/lib/github/client"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const user = await dbService.getUser(userId)

  // Retrieve access token from session or user document
  const accessToken =
    (session as any).accessToken ||
    user?.accessToken ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub access token missing. Please sign in again." },
      { status: 400 }
    )
  }

  let githubLogin = (session.user as any)?.githubLogin || user?.githubLogin

  if (!githubLogin) {
    try {
      const ghUser = await fetchGitHubUser(accessToken)
      githubLogin = ghUser.login
      await dbService.saveUser(userId, {
        githubLogin: ghUser.login,
        githubId: ghUser.id,
        image: ghUser.avatar_url || user?.image,
      })
    } catch (err) {
      return NextResponse.json(
        { error: "Could not fetch GitHub user profile" },
        { status: 500 }
      )
    }
  }

  const result = await syncUserGitHub(userId, githubLogin, accessToken)

  return NextResponse.json({ success: true, ...result })
}
