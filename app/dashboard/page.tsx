"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { StatCard } from "@/components/stat-card"
import { XpBar } from "@/components/xp-bar"
import { Heatmap } from "@/components/heatmap"
import { AchievementsCard } from "@/components/achievements-card"
import { StickerCollection } from "@/components/sticker-collection"
import { Sparkles } from "lucide-react"
import { GITHUB_SYNC_INTERVAL_MS } from "@/lib/github/constants"
import type { AchievementType } from "@/lib/engine/achievements"
import type { StickerId, StickerState } from "@/lib/engine/stickers"

interface UserStats {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  lastSyncedAt: string | null
  githubLogin: string | null
  image: string | null
  featuredStickerId: StickerId | null
}

interface ContributionItem {
  date: string
  count: number
}

interface StatsApiResponse {
  user: UserStats | null
  contributions: ContributionItem[]
  achievements: { type: AchievementType }[]
  stickers: StickerState[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [data, setData] = useState<StatsApiResponse>({
    user: null,
    contributions: [],
    achievements: [],
    stickers: [],
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
          stickers: json.stickers || [],
        })
      }
    } catch (err) {
      console.error("Failed to load stats", err)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchStats(), 0)
    return () => window.clearTimeout(timer)
  }, [fetchStats])

  const syncInBackground = useCallback(async () => {
    try {
      const res = await fetch("/api/github/sync", { method: "POST" })
      const result = await res.json().catch(() => null)
      if (res.ok && result?.synced) {
        await fetchStats()
        if (result.newAchievements?.length) {
          setSyncMessage(`${result.newAchievements.length} new sticker${result.newAchievements.length > 1 ? "s" : ""} unlocked in your collection.`)
        }
      } else if (!res.ok) {
        setSyncMessage(result?.error || "Sync failed. Please check your credentials.")
      }
    } catch {
      setSyncMessage("GitHub could not be synced right now.")
    }
  }, [fetchStats])

  useEffect(() => {
    const syncTimer = window.setTimeout(() => void syncInBackground(), 0)
    const interval = window.setInterval(() => void syncInBackground(), GITHUB_SYNC_INTERVAL_MS)
    return () => {
      window.clearTimeout(syncTimer)
      window.clearInterval(interval)
    }
  }, [syncInBackground])

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
    <div className="flex flex-col gap-6 pb-8 sm:gap-7 sm:pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-white/55">GitHub progress</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            Activity overview
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {session?.user?.name ? `GitHub activity for ${session.user.name}.` : "Your GitHub activity, at a glance."}{" "}
            {user?.lastSyncedAt
              ? `Last synced ${new Date(user.lastSyncedAt).toLocaleString()}.`
              : "Connect GitHub to start tracking."}
          </p>
        </div>

      </div>

      {syncMessage && (
        <div role="status" className="flex items-center gap-2 border-l-2 border-sky-400 px-3 py-2 text-sm text-white/70 animate-in fade-in">
          <Sparkles size={14} aria-hidden="true" className="shrink-0 text-sky-300" />
          <span>{syncMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/[0.1] md:grid-cols-4">
        <StatCard
          label="Current Streak"
          value={`${currentStreak} d`}
          sub={`Record: ${longestStreak} days`}
          accent={currentStreak > 0}
        />
        <StatCard
          label="Longest Streak"
          value={`${longestStreak} d`}
          sub="All-time high"
        />
        <StatCard
          label="Total Active Days"
          value={totalActiveDays}
          sub="Tracked on GitHub"
        />
        <StatCard
          label="Total XP"
          value={xp.toLocaleString()}
          sub={`Level ${level} Explorer`}
        />
      </div>

      <XpBar
        level={level}
        xp={currentLevelXp}
        xpForNext={xpForNext}
        progress={progressPercent}
      />

      <Heatmap contributions={data.contributions} />

      <StickerCollection
        stickers={data.stickers}
        onFeaturedChange={(featuredStickerId) => {
          setData((current) => ({
            ...current,
            user: current.user ? { ...current.user, featuredStickerId } : current.user,
            stickers: current.stickers.map((sticker) => ({
              ...sticker,
              featured: sticker.id === featuredStickerId,
            })),
          }))
        }}
      />

      <AchievementsCard unlockedTypes={unlockedAchievementTypes} />
    </div>
  )
}
