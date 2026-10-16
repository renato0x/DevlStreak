import { dbService } from "@/lib/firebase/db"
import Image from "next/image"
import Link from "next/link"
import { StatCard } from "@/components/stat-card"
import { XpBar } from "@/components/xp-bar"
import { Heatmap } from "@/components/heatmap"
import { AchievementsCard } from "@/components/achievements-card"
import { Flame, Trophy, Calendar, Zap, ArrowLeft } from "lucide-react"
import { GithubIcon } from "@/components/icons"
import type { AchievementType } from "@/lib/engine/achievements"

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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
          <GithubIcon className="text-white/40" size={24} />
        </div>
        <h1 className="text-xl font-bold">User @{username} not found</h1>
        <p className="text-sm text-white/40 mt-1 max-w-sm">
          This user has not synced their GitHub profile with DevlStreak yet.
        </p>
        <Link
          href="/login"
          className="mt-6 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          Claim your DevlStreak profile
        </Link>
      </div>
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>DevlStreak</span>
        </Link>
        <a
          href={`https://github.com/${user.githubLogin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          <GithubIcon size={14} />
          <span>github.com/{user.githubLogin}</span>
        </a>
      </div>

      {/* User Header */}
      <div className="flex items-center gap-4">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || user.githubLogin || "User avatar"}
            width={64}
            height={64}
            className="rounded-full ring-2 ring-violet-500/30"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name || user.githubLogin}
          </h1>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            @{user.githubLogin} · Level {user.level}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={`${user.currentStreak} d`}
          sub={`Record: ${user.longestStreak} days`}
          icon={<Flame size={18} className="text-violet-400" />}
          accent={user.currentStreak > 0}
        />
        <StatCard
          label="Longest Streak"
          value={`${user.longestStreak} d`}
          sub="All-time high"
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Total Active Days"
          value={user.totalActiveDays}
          sub="Tracked on GitHub"
          icon={<Calendar size={18} />}
        />
        <StatCard
          label="Total XP"
          value={user.xp.toLocaleString()}
          sub={`Level ${user.level}`}
          icon={<Zap size={18} />}
        />
      </div>

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
  )
}
