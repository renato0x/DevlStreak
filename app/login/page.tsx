"use client"

import { signIn } from "next-auth/react"
import { GithubIcon } from "@/components/icons"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-sm font-bold text-white">DS</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              DevlStreak
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Track your progress. Build your legacy.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-white">Sign in</h2>
            <p className="text-xs text-white/40 mt-0.5">
              Connect your GitHub to get started.
            </p>
          </div>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-2.5 w-full rounded-lg bg-white text-black text-sm font-medium h-10 hover:bg-white/90 transition-colors"
          >
            <GithubIcon size={16} />
            Continue with GitHub
          </button>

          <p className="text-[11px] text-white/20 text-center leading-relaxed">
            By continuing, you agree that DevlStreak will read your public
            contribution data from GitHub.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          Built by{" "}
          <a
            href="https://github.com/renato0x"
            target="_blank"
            className="text-white/40 hover:text-white/60 transition-colors"
          >
            renato0x
          </a>
        </p>
      </div>
    </div>
  )
}
