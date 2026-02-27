import Link from 'next/link'

export default function Home() {
  return (
    <section className="space-y-8 text-center">
      <h1 className="text-5xl font-bold">Welcome to THE HATCH</h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-300">
        THE HATCH is a chaotic social deduction and push‑your‑luck game for 2–10
        players. Survive the pressure, avoid the backlash and outwit your
        opponents. Play locally with friends or online with players around the
        world.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/game" className="btn">Play Now</Link>
        <Link href="/buy" className="btn bg-green-600 hover:bg-green-700">Support Us</Link>
      </div>
      <p className="text-sm text-gray-500">
        Offline? No problem — the game fully works offline. Install the app to
        your device for the best experience.
      </p>
    </section>
  )
}