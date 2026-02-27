"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
  const [offline, setOffline] = useState(false)
  useEffect(() => {
    function handleOffline() {
      setOffline(true)
    }
    function handleOnline() {
      setOffline(false)
    }
    if (typeof window !== 'undefined') {
      setOffline(!navigator.onLine)
      window.addEventListener('offline', handleOffline)
      window.addEventListener('online', handleOnline)
    }
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])
  return (
    <header className="bg-gray-800 text-white py-4 shadow">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="font-bold text-xl">THE HATCH</Link>
        <nav className="space-x-4">
          <Link href="/game" className="hover:underline">Play</Link>
          <Link href="/buy" className="hover:underline">Store</Link>
          <Link href="/versions" className="hover:underline">Versions</Link>
          <Link href="/teams" className="hover:underline">Teams</Link>
        </nav>
        {offline && <span className="text-sm text-yellow-400">Offline Ready</span>}
      </div>
    </header>
  )
}