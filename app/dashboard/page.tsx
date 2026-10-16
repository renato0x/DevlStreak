"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { StatCard } from "@/components/stat-card"
import { XpBar } from "@/components/xp-bar"
import { Heatmap } from "@/components/heatmap"
import { AchievementsCard } from "@/components/achievements-card"
import { Flame, Trophy, Calendar, Zap, RefreshCw, Sparkles, ExternalLink } from "lucide-react"
import type { AchievementType } from "@/lib/engine/achievements"

interface UserStats {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  lastSyncedAt: string | null
  githubLogin: string | null
  image: string | null
}

interface ContributionItem {
  date: string
  count: number
}

interface StatsApiResponse {
  user: UserStats | null
  contributions: ContributionItem[]
  achievements: { type: AchievementType }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [data, setData] = useState<StatsApiResponse>({
    user: null,
    contributions: [],
    achievements: [],
  })

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const json = await res.json()
        setData({
          user: json.user,
          contributions: json.contributions || [],
          achievements: json.achievements || [],
        })
      }
    } catch (err) {
      console.error("Failed to load stats", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const res = await fetch("/api/github/sync", { method: "POST" })
      const result = await res.json()
      if (res.ok) {
        setSyncMessage("Sync successful! Stats updated.")
        await fetchStats()
      } else {
        setSyncMessage(result.error || "Sync failed. Please check your credentials.")
      }
    } catch (err) {
      setSyncMessage("Error during sync.")
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }

  const user = data.user
  const currentStreak = user?.currentStreak ?? 0
  const longestStreak = user?.longestStreak ?? 0
  const totalActiveDays = user?.totalActiveDays ?? 0
  const xp = user?.xp ?? 0
  const level = user?.level ?? 1

  // Calculate XP progress in current level
  const xpForNext = level * 1000
  const currentLevelXp = xp % xpForNext
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNext) * 100))

  const unlockedAchievementTypes = data.achievements.map((a) => a.type)

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Welcome back</span>
            {session?.user?.name && (
              <span className="text-violet-400 font-semibold">
                , {session.user.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-white/40 mt-1">
            {user?.lastSyncedAt
              ? `Last synced: ${new Date(user.lastSyncedAt).toLocaleString()}`
              : "Not synced with GitHub yet"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-xs font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin text-violet-400" : ""} />
            <span>{syncing ? "Syncing GitHub..." : "Sync GitHub"}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/10 text-xs text-violet-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles size={14} className="shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={`${currentStreak} d`}
          sub={`Record: ${longestStreak} days`}
          icon={<Flame size={18} className="text-violet-400" />}
          accent={currentStreak > 0}
        />
        <StatCard
          label="Longest Streak"
          value={`${longestStreak} d`}
          sub="All-time high"
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Total Active Days"
          value={totalActiveDays}
          sub="Tracked on GitHub"
          icon={<Calendar size={18} />}
        />
        <StatCard
          label="Total XP"
          value={xp.toLocaleString()}
          sub={`Level ${level} Explorer`}
          icon={<Zap size={18} />}
        />
      </div>

      {/* Level & XP Progression */}
      <XpBar
        level={level}
        xp={currentLevelXp}
        xpForNext={xpForNext}
        progress={progressPercent}
      />

      {/* Heatmap Section */}
      <Heatmap contributions={data.contributions} />

      {/* Achievements Section */}
      <AchievementsCard unlockedTypes={unlockedAchievementTypes} />
    </div>
  )
}
