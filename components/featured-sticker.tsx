import type { StickerDefinition } from "@/lib/engine/stickers"
import { StickerMark } from "./sticker-mark"

export function FeaturedSticker({ sticker }: { sticker: StickerDefinition }) {
  return (
    <div className="flex items-center gap-3 bg-[#15191c] px-3 py-2.5 text-left">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-sky-300">
        <StickerMark icon={sticker.icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white/55">Featured sticker</p>
        <p className="truncate text-sm font-medium text-white">{sticker.label}</p>
      </div>
    </div>
  )
}
