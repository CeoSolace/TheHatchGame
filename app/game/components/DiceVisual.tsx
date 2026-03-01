"use client"

import { useMemo } from "react"
import { Icon } from "./Icon"

export function DiceVisual({ value }: { value: number }) {
  const pips = useMemo(() => {
    const map: Record<number, [number, number][]> = {
      1: [[12, 12]],
      2: [
        [8, 8],
        [16, 16],
      ],
      3: [
        [8, 8],
        [12, 12],
        [16, 16],
      ],
      4: [
        [8, 8],
        [16, 8],
        [8, 16],
        [16, 16],
      ],
      5: [
        [8, 8],
        [16, 8],
        [12, 12],
        [8, 16],
        [16, 16],
      ],
      6: [
        [8, 8],
        [16, 8],
        [8, 12],
        [16, 12],
        [8, 16],
        [16, 16],
      ],
    }
    return map[Math.min(6, Math.max(1, value))] || map[1]
  }, [value])

  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative">
        <svg viewBox="0 0 24 24" className="w-14 h-14 drop-shadow">
          <defs>
            <linearGradient id="dieGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.35)" />
            </linearGradient>
          </defs>

          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="19"
            rx="4"
            fill="url(#dieGrad)"
            stroke="rgba(255,255,255,0.25)"
          />

          {pips.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="rgba(255,255,255,0.92)" />
          ))}
        </svg>

        <div className="absolute -top-2 -right-2 text-white/70">
          <Icon name="dice" className="w-5 h-5" />
        </div>
      </div>

      <div className="text-sm text-white/70">
        <div className="font-semibold">Roll</div>
        <div className="text-white text-lg leading-none">{value}</div>
      </div>
    </div>
  )
}
