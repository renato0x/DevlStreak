import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { dbService } from "@/lib/firebase/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubProfile = profile as {
          login?: string
          id?: number
          avatar_url?: string
        }
        const githubLogin = githubProfile.login
        const githubId = githubProfile.id
        token.githubLogin = githubLogin
        token.githubId = githubId

        const userId = token.sub || githubId?.toString()
        if (userId && githubLogin && githubId && account.access_token) {
          try {
            await dbService.upsertUserProfile(userId, {
              name: token.name || githubLogin,
              image: token.picture || githubProfile.avatar_url || null,
              githubLogin,
              githubId,
            })
            await dbService.saveGitHubCredential(userId, {
              accessToken: account.access_token,
              githubLogin,
              githubId,
            })
          } catch (e) {
            console.error("Error saving GitHub account data", e)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || ""
        session.user.githubLogin =
          typeof token.githubLogin === "string" ? token.githubLogin : undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
