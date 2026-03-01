"use client"

import { Icon } from "./Icon"

export function PlayerCard({
  displayName,
  userId,
  hearts,
  cowardTokens,
  isHost,
  isTurn,
}: {
  displayName: string
  userId: string
  hearts: number
  cowardTokens: number
  isHost?: boolean
  isTurn?: boolean
}) {
  return (
    <div
      className={[
        "rounded-xl border p-3 bg-gradient-to-b from-white/5 to-white/0",
        isTurn
          ? "border-yellow-400/60 shadow-[0_0_0_1px_rgba(250,204,21,.25)]"
          : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold truncate">{displayName}</div>

            {isHost && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                <Icon name="crown" className="w-3.5 h-3.5" />
                Host
              </span>
            )}

            {isTurn && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-200">
                Turn
              </span>
            )}
          </div>

          <div className="text-xs text-white/50 truncate">id: {userId}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <Icon name="heart" className="w-4 h-4 text-red-300" />
            <span className="text-sm font-semibold">{hearts}</span>
          </div>

          <div className="flex items-center gap-1">
            <Icon name="shield" className="w-4 h-4 text-sky-200" />
            <span className="text-sm font-semibold">{cowardTokens}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
