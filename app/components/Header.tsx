"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Header() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(typeof navigator !== "undefined" ? !navigator.onLine : false)
    update()
    window.addEventListener("offline", update)
    window.addEventListener("online", update)
    return () => {
      window.removeEventListener("offline", update)
      window.removeEventListener("online", update)
    }
  }, [])

  return (
    <header className="bg-gray-900 text-white py-4 shadow">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image src="/app-icon.png" alt="THE HATCH" width={28} height={28} priority />
          <span>THE HATCH</span>
        </Link>

        <nav className="space-x-4 text-sm">
          <Link href="/game" className="hover:underline">Play</Link>
          <Link href="/versions" className="hover:underline">Rules</Link>
          <Link href="/buy" className="hover:underline">Store</Link>
          <Link href="/teams" className="hover:underline">Teams</Link>
          <Link href="/account" className="hover:underline">Account</Link>
          <Link href="/admin/login" className="hover:underline">Admin</Link>
        </nav>

        {offline && <span className="text-xs text-yellow-400">Offline Ready</span>}
      </div>
    </header>
  )
}
