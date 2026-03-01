"use client"

export default function FundingBanner({
  donateLink,
}: {
  donateLink?: string
}) {
  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
      <div className="font-semibold text-white mb-1">
        Visual Upgrade In Progress
      </div>

      <p className="text-white/70">
        Current visuals are code-generated placeholders.
        We’re planning a full custom art pass (UI, animations, assets).
      </p>

      {donateLink ? (
        <a
          href={donateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
        >
          Help Fund Graphics
        </a>
      ) : (
        <div className="mt-3 text-xs text-white/40">
          Donations currently disabled.
        </div>
      )}
    </div>
  )
}
