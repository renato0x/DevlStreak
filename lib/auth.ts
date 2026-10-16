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
        token.accessToken = account.access_token
        token.githubLogin = (profile as any).login
        token.githubId = (profile as any).id

        // Auto-save user to Firestore
        const userId = token.sub || (profile as any).id?.toString()
        if (userId) {
          try {
            await dbService.saveUser(userId, {
              id: userId,
              name: token.name || (profile as any).login,
              email: token.email || null,
              image: token.picture || (profile as any).avatar_url,
              githubLogin: (profile as any).login,
              githubId: (profile as any).id,
              accessToken: account.access_token,
              createdAt: new Date().toISOString(),
            })
          } catch (e) {
            console.error("Error saving user to Firestore in JWT callback", e)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || ""
        ;(session.user as any).githubLogin = token.githubLogin
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
