"use client"
import { useState } from 'react'

interface PlayerState {
  name: string
  hearts: number
  hand: string[]
  coward: number
  alive: boolean
  openedInRound: boolean
}

export default function OfflineHotseat() {
  const [stage, setStage] = useState<'setup' | 'play' | 'end'>('setup')
  const [numPlayers, setNumPlayers] = useState(2)
  const [names, setNames] = useState<string[]>([])
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [current, setCurrent] = useState(0)
  const [deck, setDeck] = useState<string[]>([])
  const [discard, setDiscard] = useState<string[]>([])
  const [pressure, setPressure] = useState(0)
  const [log, setLog] = useState<string[]>([])

  // Setup handlers
  function beginGame() {
    const initialPlayers: PlayerState[] = []
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({
        name: names[i] || `Player ${i + 1}`,
        hearts: 3,
        hand: [],
        coward: 0,
        alive: true,
        openedInRound: false,
      })
    }
    let newDeck: string[] = []
    for (let i = 1; i <= 20; i++) newDeck.push(`A${i}`)
    newDeck = shuffle(newDeck)
    // deal 2 cards
    initialPlayers.forEach((p) => {
      p.hand = [newDeck.pop()!, newDeck.pop()!]
    })
    setPlayers(initialPlayers)
    setDeck(newDeck)
    setDiscard([])
    setCurrent(0)
    setPressure(0)
    setLog([`Game started with ${numPlayers} players`])
    setStage('play')
  }

  function shuffle<T>(arr: T[]): T[] {
    return arr
      .map((v) => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ v }) => v)
  }

  // Player plays action card (simplified: just discard)
  function playCard(card: string) {
    const p = players[current]
    if (!p.hand.includes(card)) return
    const newPlayers = [...players]
    newPlayers[current].hand = p.hand.filter((c) => c !== card)
    setPlayers(newPlayers)
    setDiscard([...discard, card])
    addLog(`${p.name} played ${card}`)
  }

  // Player chooses Safe or Open
  function choose(option: 'safe' | 'open') {
    const p = players[current]
    if (!p.alive) return nextTurn()
    if (option === 'safe') {
      // Check if sudden death (pressure >=10)
      if (pressure >= 10) {
        addLog('Safe option disabled in Sudden Death!')
        return
      }
      const newPlayers = [...players]
      newPlayers[current].coward += 1
      // Draw a card if deck not empty
      if (deck.length === 0) reshuffleDeck()
      const card = deck.pop()
      if (card) newPlayers[current].hand.push(card)
      addLog(`${p.name} chose SAFE and drew a card.`)
      setPlayers(newPlayers)
    } else {
      // Open
      const die = rollDie()
      resolveDie(die)
      const newPlayers = [...players]
      newPlayers[current].coward = 0
      newPlayers[current].openedInRound = true
      setPlayers(newPlayers)
    }
    nextTurn()
  }

  function nextTurn() {
    // Move to next alive player
    let nextIndex = current
    for (let i = 1; i <= players.length; i++) {
      nextIndex = (current + i) % players.length
      if (players[nextIndex].alive) break
    }
    // Check if full round completed (current -> next smaller index?) We'll detect when currentIndex resets to smallest alive index
    const smallestAlive = players.findIndex((p) => p.alive)
    const newCurrent = nextIndex
    const roundCompleted = newCurrent === smallestAlive
    setCurrent(newCurrent)
    if (roundCompleted) endOfRound()
  }

  function endOfRound() {
    // Backlash: if all alive players have coward tokens >=1
    const alivePlayers = players.filter((p) => p.alive)
    const allCowards = alivePlayers.every((p) => p.coward >= 1)
    if (allCowards) {
      const newPlayers = players.map((p) => {
        if (!p.alive) return { ...p }
        const loss = p.coward >= 2 ? 2 : 1
        const hearts = Math.max(0, p.hearts - loss)
        return { ...p, hearts, coward: 0 }
      })
      addLog('Backlash! All players penalised for being cowards.')
      setPlayers(checkDeaths(newPlayers))
    }
    // Bravery bonus: exactly one opened in full round
    const openers = alivePlayers.filter((p) => p.openedInRound)
    if (openers.length === 1) {
      const idx = players.indexOf(openers[0])
      // Give choice: heart or card or remove 1 heart from player with 2+ tokens
      // For simplicity: automatically give heart if not max, else draw card
      const newPlayers = [...players]
      const pl = newPlayers[idx]
      if (pl.hearts < 5) {
        pl.hearts += 1
        addLog(`${pl.name} receives Bravery Bonus: +1 heart`)
      } else {
        if (deck.length === 0) reshuffleDeck()
        const card = deck.pop()
        if (card) pl.hand.push(card)
        addLog(`${pl.name} receives Bravery Bonus: drew a card`)
      }
      setPlayers(newPlayers)
    }
    // Reset openedInRound flags
    setPlayers((prev) => prev.map((p) => ({ ...p, openedInRound: false })))
  }

  function reshuffleDeck() {
    const newDeck = shuffle(discard)
    setDiscard([])
    setDeck(newDeck)
    addLog('Deck reshuffled')
  }

  function rollDie(): number {
    return Math.floor(Math.random() * 6) + 1
  }

  function resolveDie(die: number) {
    const p = players[current]
    let msg = ''
    const newPlayers = [...players]
    const modify = (idx: number, diff: number) => {
      const pl = newPlayers[idx]
      pl.hearts = Math.max(0, Math.min(5, pl.hearts + diff))
    }
    // Pressure threshold modifications
    const press = pressure
    function adjustBasedOnPressure(baseOutcome: () => void, alt: () => void) {
      if (
        (die === 2 && press >= 2) ||
        (die === 3 && press >= 4) ||
        (die === 4 && press >= 6)
      ) {
        alt()
      } else {
        baseOutcome()
      }
    }
    switch (die) {
      case 1:
        modify(current, -1)
        msg = `${p.name} rolled 1 and lost 1 heart.`
        break
      case 2:
        adjustBasedOnPressure(
          () => {
            msg = `${p.name} rolled 2 and nothing happened.`
          },
          () => {
            modify(current, -1)
            msg = `${p.name} rolled 2 (pressure ${press}) and lost 1 heart.`
          }
        )
        break
      case 3:
        adjustBasedOnPressure(
          () => {
            modify(current, +1)
            msg = `${p.name} rolled 3 and gained 1 heart.`
          },
          () => {
            newPlayers.forEach((pl, idx) => modify(idx, -1))
            msg = `${p.name} rolled 3 (pressure ${press}) and everyone lost 1 heart.`
          }
        )
        break
      case 4:
        adjustBasedOnPressure(
          () => {
            newPlayers.forEach((_, idx) => modify(idx, -1))
            msg = `${p.name} rolled 4 and everyone lost 1 heart.`
          },
          () => {
            newPlayers.forEach((_, idx) => modify(idx, -2))
            msg = `${p.name} rolled 4 (pressure ${press}) and everyone lost 2 hearts.`
          }
        )
        break
      case 5:
        // Force: choose next alive to lose 1
        let target = (current + 1) % players.length
        while (!players[target].alive && target !== current) {
          target = (target + 1) % players.length
        }
        modify(target, -1)
        msg = `${p.name} rolled 5 and forced ${players[target].name} to lose 1 heart.`
        break
      case 6:
        // Chaos: increase pressure
        const newPressure = press + 1
        setPressure(newPressure)
        msg = `${p.name} rolled 6 and chaos ensued. Pressure is now ${newPressure}.`
        // Additional effects at high pressure
        break
    }
    setPlayers(checkDeaths(newPlayers))
    addLog(msg)
  }

  function checkDeaths(currentPlayers: PlayerState[]) {
    let aliveCount = 0
    const updated = currentPlayers.map((p) => {
      const alive = p.alive && p.hearts > 0
      if (alive) aliveCount += 1
      return { ...p, alive }
    })
    if (aliveCount <= 1) {
      setStage('end')
    }
    return updated
  }

  function addLog(message: string) {
    setLog((prev) => [message, ...prev].slice(0, 50))
  }

  // Setup view
  if (stage === 'setup') {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Local Hotseat</h1>
        <label className="block text-sm">Number of players (2–10)</label>
        <input
          type="number"
          min={2}
          max={10}
          value={numPlayers}
          onChange={(e) => setNumPlayers(parseInt(e.target.value))}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
        {Array.from({ length: numPlayers }).map((_, i) => (
          <input
            key={i}
            placeholder={`Player ${i + 1} name`}
            value={names[i] || ''}
            onChange={(e) => {
              const copy = [...names]
              copy[i] = e.target.value
              setNames(copy)
            }}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 mt-2"
          />
        ))}
        <button onClick={beginGame} className="btn w-full mt-4">
          Start Game
        </button>
      </div>
    )
  }
  if (stage === 'end') {
    const winner = players.find((p) => p.alive)
    return (
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Game Over</h1>
        <p>{winner ? `${winner.name} wins!` : 'Everyone is dead!'}</p>
        <button onClick={() => setStage('setup')} className="btn">Play Again</button>
      </div>
    )
  }
  // Play view
  const currentPlayer = players[current]
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Current Player: {currentPlayer.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        {players.map((p, idx) => (
          <div key={idx} className="border border-gray-700 p-2 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p>Hearts: {p.hearts}</p>
            <p>Coward: {p.coward}</p>
            <p>Hand: {p.hand.join(', ') || '—'}</p>
            {!p.alive && <p className="text-red-500">Dead</p>}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {currentPlayer.hand.map((card) => (
            <button key={card} onClick={() => playCard(card)} className="btn text-xs">
              Play {card}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={() => choose('safe')} className="btn">Safe</button>
          <button onClick={() => choose('open')} className="btn">Open</button>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="font-semibold">Log</h3>
        <ul className="max-h-40 overflow-y-auto text-sm space-y-1">
          {log.map((entry, idx) => (
            <li key={idx}>{entry}</li>
          ))}
        </ul>
      </div>
      <p>Pressure: {pressure}</p>
    </div>
  )
}