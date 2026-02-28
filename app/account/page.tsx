import { Suspense } from "react"
import AccountClient from "./AccountClient"

export const dynamic = "force-dynamic"

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading…</div>}>
      <AccountClient />
    </Suspense>
  )
}
