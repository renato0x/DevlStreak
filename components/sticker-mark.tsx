import { CalendarDays, Flame, Orbit, Rocket, Sparkles, Trophy } from "lucide-react"
import type { StickerIcon } from "@/lib/engine/stickers"

const icons = {
  spark: Sparkles,
  flame: Flame,
  calendar: CalendarDays,
  orbit: Orbit,
  rocket: Rocket,
  trophy: Trophy,
}

export function StickerMark({ icon, size = 20 }: { icon: StickerIcon; size?: number }) {
  const Icon = icons[icon]
  return <Icon aria-hidden="true" size={size} strokeWidth={1.7} />
}
