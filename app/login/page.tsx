"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { GithubIcon } from "@/components/icons"

export default function LoginPage() {
  return (
    <main className="min-h-[100svh] bg-[#0a0a0a] text-white flex items-center justify-center px-5 py-10 sm:px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-5 mb-8 text-center">
          <Image
            src="/logo.png"
            alt="DevlStreak"
            width={60}
            height={60}
            className="rounded-[18px] ring-1 ring-white/15"
            priority
          />
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-[-0.03em]">
              DevlStreak
            </h1>
            <p className="text-sm text-white/50 mt-2 leading-6">
              Track your progress. Build your legacy.
            </p>
          </div>
        </div>

        {/* Card */}
        <section className="mx-4 flex flex-col gap-5 rounded-[20px] border border-white/10 bg-[#111111] p-6 sm:mx-0 sm:p-7">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Sign in with GitHub</h2>
            <p className="text-sm text-white/50 mt-2 leading-6">
              Connect your GitHub to get started.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-2.5 w-full rounded-[10px] bg-white text-black text-sm font-semibold h-12 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] transition-colors"
          >
            <GithubIcon size={16} />
            Continue with GitHub
          </button>

          <p className="text-xs text-white/35 text-center leading-5">
            By continuing, you agree that DevlStreak will read your public
            contribution data from GitHub.
          </p>
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-7">
          Built by{" "}
          <a
            href="https://github.com/renato0x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm transition-colors"
          >
            renato0x
          </a>
        </p>
      </div>
    </main>
  )
}
