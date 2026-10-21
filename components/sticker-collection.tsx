"use client"

import { useState } from "react"
import { Check, LockKeyhole } from "lucide-react"
import type { StickerId, StickerState } from "@/lib/engine/stickers"
import { StickerMark } from "./sticker-mark"
import { cn } from "@/lib/utils"

interface StickerCollectionProps {
  stickers: StickerState[]
  onFeaturedChange: (stickerId: StickerId | null) => void
}

export function StickerCollection({ stickers, onFeaturedChange }: StickerCollectionProps) {
  const featuredStickerId = stickers.find((sticker) => sticker.featured)?.id ?? null
  const [pendingStickerId, setPendingStickerId] = useState<StickerId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const unlockedCount = stickers.filter((sticker) => sticker.unlocked).length

  async function setFeatured(stickerId: StickerId | null) {
    setPendingStickerId(stickerId ?? featuredStickerId)
    setError(null)

    try {
      const response = await fetch("/api/stickers/equipped", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickerId }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Could not update your featured sticker.")

      onFeaturedChange(result.featuredStickerId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your featured sticker.")
    } finally {
      setPendingStickerId(null)
    }
  }

  return (
    <section className="bg-[#111111] p-4 sm:p-5" aria-labelledby="sticker-collection-title">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="sticker-collection-title" className="text-base font-medium text-white">Sticker collection</h2>
          <p className="mt-1 text-xs leading-5 text-white/60">Each achievement adds a sticker. Feature one on your public profile.</p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-white/60">{unlockedCount} / {stickers.length}</span>
      </div>

      {error && <p role="status" className="mb-4 text-sm text-rose-300">{error}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        {stickers.map((sticker) => {
          const featured = sticker.id === featuredStickerId
          const pending = sticker.id === pendingStickerId
          const controlLabel = featured ? `Remove ${sticker.label} from your profile` : `Feature ${sticker.label} on your profile`

          return (
            <div
              key={sticker.id}
              className={cn(
                "min-h-40 p-3 sm:min-h-36",
                featured ? "bg-[#20252a]" : "bg-[#181818]",
                !sticker.unlocked && "bg-[#151515] text-white/45"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", sticker.unlocked ? "bg-sky-400/15 text-sky-300" : "bg-white/[0.06] text-white/35")}>
                  {sticker.unlocked ? <StickerMark icon={sticker.icon} size={18} /> : <LockKeyhole aria-hidden="true" size={16} />}
                </span>
                {featured && <Check aria-label="Featured" size={16} className="text-sky-300" />}
              </div>

              <h3 className="mt-4 text-sm font-medium leading-5 text-white">{sticker.label}</h3>
              <p className="mt-1 min-h-10 text-xs leading-5 text-white/55">{sticker.description}</p>

              {sticker.unlocked ? (
                <button
                  type="button"
                  onClick={() => void setFeatured(featured ? null : sticker.id)}
                  disabled={pendingStickerId !== null}
                  aria-label={controlLabel}
                  className={cn(
                    "mt-3 min-h-11 w-full rounded-sm px-1 text-left text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60",
                    featured ? "text-sky-300 hover:text-sky-200" : "text-white/60 hover:text-white"
                  )}
                >
                  {pending ? "Saving…" : featured ? "Featured" : "Feature"}
                </button>
              ) : (
                <p className="mt-3 text-xs text-white/45">Locked</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
