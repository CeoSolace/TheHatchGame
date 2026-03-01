"use client"

type IconName =
  | "heart"
  | "skull"
  | "shield"
  | "bolt"
  | "dice"
  | "warning"
  | "crown"
  | "chat"
  | "hatch"

export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: IconName
  className?: string
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (name) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20.8 4.6c-1.6-1.6-4.1-1.6-5.7 0L12 7.7 8.9 4.6c-1.6-1.6-4.1-1.6-5.7 0s-1.6 4.1 0 5.7L12 21l8.8-10.7c1.6-1.6 1.6-4.1 0-5.7z" />
        </svg>
      )

    case "skull":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3c-4.4 0-8 3.2-8 7.2 0 2.7 1.6 5 4 6.3V20h8v-3.5c2.4-1.3 4-3.6 4-6.3C20 6.2 16.4 3 12 3z" />
          <path d="M9 12h0M15 12h0" />
          <path d="M10 16h4" />
        </svg>
      )

    case "shield":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" />
        </svg>
      )

    case "bolt":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      )

    case "dice":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 8h0M16 16h0M16 8h0M8 16h0M12 12h0" />
        </svg>
      )

    case "warning":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l10 18H2L12 3z" />
          <path d="M12 9v4" />
          <path d="M12 17h0" />
        </svg>
      )

    case "crown":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 7l4 4 5-7 5 7 4-4v10H3V7z" />
          <path d="M3 17h18" />
        </svg>
      )

    case "chat":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
        </svg>
      )

    case "hatch":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3c5 0 9 4 9 9 0 4.2-2.8 7.8-6.7 8.8-.9-1.8-2.4-3.3-4.3-4.1-1.9.8-3.4 2.3-4.3 4.1C5.8 19.8 3 16.2 3 12c0-5 4-9 9-9z" />
          <path d="M8 13c1.2-1 2.6-1.5 4-1.5S14.8 12 16 13" />
        </svg>
      )
  }
}
