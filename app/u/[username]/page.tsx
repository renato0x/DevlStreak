import { dbService } from "@/lib/firebase/db"
import Image from "next/image"
import Link from "next/link"
import { StatCard } from "@/components/stat-card"
import { XpBar } from "@/components/xp-bar"
import { Heatmap } from "@/components/heatmap"
import { AchievementsCard } from "@/components/achievements-card"
import { ArrowLeft } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import { FeaturedSticker } from "@/components/featured-sticker"
import { getStickerDefinition } from "@/lib/engine/stickers"

export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const user = await dbService.getUserByLogin(username)

  if (!user) {
    return (
      <main className="min-h-[100svh] bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center mb-5">
          <GithubIcon className="text-white/40" size={24} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">User @{username} not found</h1>
        <p className="text-sm text-white/50 mt-3 max-w-sm leading-6">
          This user has not synced their GitHub profile with DevlStreak yet.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex min-h-11 items-center px-5 rounded-[10px] bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] transition-colors"
        >
          Claim your DevlStreak profile
        </Link>
      </main>
    )
  }

  const userContributions = await dbService.getContributions(user.id)
  const userAchievements = await dbService.getAchievements(user.id)

  const xp = user.xp
  const level = user.level
  const xpForNext = level * 1000
  const currentLevelXp = xp % xpForNext
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNext) * 100))
  const unlockedTypes = userAchievements.map((a) => a.type)
  const featuredSticker = getStickerDefinition(user.featuredStickerId)

  return (
    <main className="min-h-[100svh] bg-[#0a0a0a] text-white px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 sm:gap-10">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to DevlStreak</span>
          </Link>
          <a
            href={`https://github.com/${user.githubLogin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1.5 text-sm text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm transition-colors"
          >
            <GithubIcon size={14} />
            <span className="truncate max-w-[15rem] sm:max-w-none">github.com/{user.githubLogin}</span>
          </a>
        </header>

        {/* User Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || user.githubLogin || "User avatar"}
                width={76}
                height={76}
                className="rounded-full ring-2 ring-sky-500/30"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] leading-tight">
                {user.name || user.githubLogin}
              </h1>
              <p className="text-sm text-white/50 mt-2">
                @{user.githubLogin} <span className="text-white/25">·</span> Level {user.level}
              </p>
            </div>
          </div>
          {featuredSticker ? (
            <FeaturedSticker sticker={featuredSticker} />
          ) : (
            <p className="max-w-xs text-sm leading-6 text-white/55 sm:text-right">Streaks, levels, and milestones from GitHub.</p>
          )}
        </section>

      {/* Stat Cards */}
      <section aria-label="Profile statistics" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Current Streak"
          value={`${user.currentStreak} d`}
          sub={`Record: ${user.longestStreak} days`}
          accent={user.currentStreak > 0}
        />
        <StatCard
          label="Longest Streak"
          value={`${user.longestStreak} d`}
          sub="All-time high"
        />
        <StatCard
          label="Total Active Days"
          value={user.totalActiveDays}
          sub="Tracked on GitHub"
        />
        <StatCard
          label="Total XP"
          value={user.xp.toLocaleString()}
          sub={`Level ${user.level}`}
        />
      </section>

      {/* Progression */}
      <XpBar
        level={level}
        xp={currentLevelXp}
        xpForNext={xpForNext}
        progress={progressPercent}
      />

      {/* Heatmap */}
      <Heatmap contributions={userContributions} />

      {/* Achievements */}
      <AchievementsCard unlockedTypes={unlockedTypes} />
      </div>
    </main>
  )
}
