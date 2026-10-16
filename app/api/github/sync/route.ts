import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { accounts, users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { syncUserGitHub } from "@/lib/github/sync"
import { fetchGitHubUser } from "@/lib/github/client"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Get the GitHub access token from the accounts table
  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.provider, "github")),
  })

  if (!account?.access_token) {
    return NextResponse.json({ error: "GitHub account not linked" }, { status: 400 })
  }

  // Get github login from user or fetch from GitHub API
  let user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  })

  let githubLogin = user?.githubLogin

  if (!githubLogin) {
    try {
      const ghUser = await fetchGitHubUser(account.access_token)
      githubLogin = ghUser.login
      await db
        .update(users)
        .set({
          githubLogin: ghUser.login,
          githubId: ghUser.id,
          image: ghUser.avatar_url || user?.image,
        })
        .where(eq(users.id, userId))
    } catch (err) {
      return NextResponse.json({ error: "Could not fetch GitHub user info" }, { status: 500 })
    }
  }

  const result = await syncUserGitHub(userId, githubLogin, account.access_token)

  return NextResponse.json({ success: true, ...result })
}
