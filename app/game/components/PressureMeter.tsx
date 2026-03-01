"use client"

import { Icon } from "./Icon"

export function PressureMeter({ pressure }: { pressure: number }) {
  const max = 10
  const pct = Math.min(100, Math.max(0, (pressure / max) * 100))

  return (
    <div className="rounded-xl border border-white/10 p-3 bg-white/5 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="bolt" className="w-4 h-4 text-yellow-200" />
          Pressure
        </div>
        <div className="text-sm text-white/70">
          {pressure}/{max}
        </div>
      </div>

      <div className="mt-2 h-3 rounded-full bg-black/30 overflow-hidden border border-white/10">
        <div className="h-full rounded-full bg-white/70" style={{ width: `${pct}%` }} />
      </div>

      {pressure >= 10 && (
        <div className="mt-2 text-xs text-red-200 flex items-center gap-2">
          <Icon name="warning" className="w-4 h-4" />
          Sudden Death active
        </div>
      )}
    </div>
  )
}
