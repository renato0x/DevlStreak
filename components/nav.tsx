"use client"

import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import Image from "next/image"

export function Nav() {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-violet-500 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">DS</span>
        </div>
        <span className="font-semibold text-sm text-white tracking-tight">
          DevlStreak
        </span>
      </div>

      {session?.user && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:block">
            @{(session.user as any).githubLogin ?? session.user.name}
          </span>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full ring-1 ring-white/10"
            />
          )}
          <button
            onClick={() => signOut()}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
