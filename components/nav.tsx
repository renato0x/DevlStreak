"use client"

import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import Image from "next/image"

export function Nav() {
  const { data: session } = useSession()
  const githubLogin = session?.user?.githubLogin ?? session?.user?.name

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 px-4 sm:min-h-16 sm:px-6">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="DevlStreak"
          width={28}
          height={28}
          className="rounded-lg ring-1 ring-white/10"
          priority
        />
        <span className="font-semibold text-sm text-white tracking-[-0.02em]">
          DevlStreak
        </span>
      </div>

      {session?.user && (
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="text-xs text-white/50 hidden sm:block">
            @{githubLogin}
          </span>
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={`${session.user.name ?? githubLogin ?? "GitHub"} avatar`}
              width={28}
              height={28}
              className="rounded-full ring-1 ring-white/10"
            />
          )}
          <button
            onClick={() => signOut()}
            type="button"
            className="inline-flex min-h-11 items-center rounded-sm px-2 text-xs text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
